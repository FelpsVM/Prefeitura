// ===== Abas =====

var tabs = document.querySelectorAll(".tab");
var contents = {
    conta: document.getElementById("secao-conta"),
    avisos: document.getElementById("secao-avisos")
};

tabs.forEach(function(tab) {
    tab.addEventListener("click", function() {
        var target = tab.getAttribute("data-tab");

        tabs.forEach(function(t) {
            var isActive = t === tab;
            t.classList.toggle("active", isActive);
            t.setAttribute("aria-selected", isActive ? "true" : "false");
        });

        Object.keys(contents).forEach(function(key) {
            contents[key].hidden = key !== target;
        });
    });
});

// ===== Dados do usuário =====

function formatDate(isoString) {
    if (!isoString) {
        return "—";
    }
    var parts = isoString.split(" ")[0].split("-");
    if (parts.length !== 3) {
        return isoString;
    }
    return parts[2] + "/" + parts[1] + "/" + parts[0];
}

function loadUserInfo() {
    fetch("/getUserInfo")
        .then(function(response) {
            return response.json().then(function(data) {
                return { ok: response.ok, data: data };
            });
        })
        .then(function(result) {
            if (!result.ok || !result.data.success) {
                window.location.href = "/login";
                return;
            }

            var user = result.data.user;

            document.getElementById("infoName").textContent = user.name;
            document.getElementById("infoEmail").textContent = user.email;
            document.getElementById("infoPhone").textContent = user.phone;
            document.getElementById("infoCreatedAt").textContent = formatDate(user.created_at);

            setChannelState("email", user.notify_email);
            setChannelState("sms", user.notify_sms);
            setChannelState("whatsapp", user.notify_whatsapp);
            updateDisabledState();
        })
        .catch(function(error) {
            console.error("Erro ao carregar dados do usuário:", error);
        });
}

// ===== Canais de aviso (mínimo 1 sempre ativo) =====

var channelButtons = document.querySelectorAll(".channel-btn");

function getChannelButton(channel) {
    return document.querySelector('.channel-btn[data-channel="' + channel + '"]');
}

function setChannelState(channel, active) {
    var btn = getChannelButton(channel);
    if (!btn) {
        return;
    }
    btn.classList.toggle("active", !!active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
}

function getActiveChannels() {
    var active = [];
    channelButtons.forEach(function(btn) {
        if (btn.classList.contains("active")) {
            active.push(btn.getAttribute("data-channel"));
        }
    });
    return active;
}

// Desabilita o botão ativo quando ele é o único restante,
// para impedir que o usuário fique sem nenhum canal selecionado.
function updateDisabledState() {
    var active = getActiveChannels();
    var onlyOneLeft = active.length === 1;

    channelButtons.forEach(function(btn) {
        var isTheLastActive = onlyOneLeft && btn.classList.contains("active");
        btn.disabled = isTheLastActive;
    });
}

function saveNotificationPrefs() {
    var active = getActiveChannels();

    fetch("/updateNotifications", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: active.indexOf("email") !== -1,
            sms: active.indexOf("sms") !== -1,
            whatsapp: active.indexOf("whatsapp") !== -1
        })
    })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            if (!data.success) {
                console.error("Erro ao salvar preferências:", data.message);
            }
        })
        .catch(function(error) {
            console.error("Erro ao salvar preferências:", error);
        });
}

channelButtons.forEach(function(btn) {
    btn.addEventListener("click", function() {
        if (btn.disabled) {
            return;
        }

        btn.classList.toggle("active");
        btn.setAttribute("aria-pressed", btn.classList.contains("active") ? "true" : "false");

        updateDisabledState();
        saveNotificationPrefs();
    });
});

// ===== Alterar senha =====
// Propositalmente sem nenhum listener por enquanto — o botão
// existe apenas visualmente até essa funcionalidade ser implementada.

// ===== Inicialização =====

loadUserInfo();