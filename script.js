let usuario; 
let destinatario = "Todos"; 
let reservado = false; 

function registrarUsuario() {
  const nome = prompt("Digite seu nome:");
  if (!nome || nome.trim() === "") {
    alert("Por favor, insira um nome válido.");
    registrarUsuario();
    return;
  }
  usuario = nome.trim();
  axios
    .post("https://mock-api.driven.com.br/api/v6/uol/participants/91c6e8c3-62f7-4f3c-89a9-57906c19e160", { name: usuario })
    .then(() => {
      console.log(`Usuário "${usuario}" registrado com sucesso!`);
      const chat = document.querySelector(".chat");
      const mensagemElemento = document.createElement("div");
      mensagemElemento.classList.add("mensagem", "sistema"); 
      mensagemElemento.innerHTML = `
        <span class="hora">(Agora)</span>
        <span class="usuario">${usuario}</span> entrou na sala...
      `;
      chat.appendChild(mensagemElemento);

      
      chat.scrollTop = chat.scrollHeight;
      carregarMensagens(); 
      carregarUsuariosOnline()
      setInterval(carregarMensagens, 3000);
      setInterval(manterUsuarioConectado, 5000);
    })
    .catch((error) => {
      if (error.response && error.response.status === 400) {
        alert("Esse nome já está em uso. Por favor, escolha outro.");
        registrarUsuario();
      } else {
        console.error("Erro ao registrar usuário:", error);
      }
      window.location.reload();
    });
}

function enviarMensagem() {
  const input = document.querySelector(".escrita");
  const mensagem = input.value.trim();

  if (mensagem === "") return;

  const corpoMensagem = {
    from: usuario,
    to: destinatario,
    text: mensagem,
    type: reservado ? "private_message" : "message", 
  };

  axios
    .post("https://mock-api.driven.com.br/api/v6/uol/messages/91c6e8c3-62f7-4f3c-89a9-57906c19e160", corpoMensagem)
    .then(() => {
      input.value = ""; 
      carregarMensagens(); 

      const elementoQueQueroQueApareca = document.querySelector('.chat .mensagem:last-child');
      elementoQueQueroQueApareca.scrollIntoView({ behavior: 'smooth' });
    })
    .catch((error) => {
      console.error("Erro ao enviar mensagem:", error);
    });
}

function carregarMensagens() {
  axios
    .get("https://mock-api.driven.com.br/api/v6/uol/messages/91c6e8c3-62f7-4f3c-89a9-57906c19e160")
    .then((response) => {
      const chat = document.querySelector(".chat");
      chat.innerHTML = ""; 

      response.data.forEach((msg) => {
        if (msg.type === "private_message" && msg.to !== usuario && msg.from !== usuario) {
          return;
        }

        const mensagemElemento = document.createElement("div");
        mensagemElemento.classList.add("mensagem");

        if (msg.type === "status") {
          mensagemElemento.classList.add("sistema");
          mensagemElemento.innerHTML = `
            <span class="hora">(${msg.time})</span> 
            <span class="texto">${msg.from} ${msg.text}</span>
          `;
        } else if (msg.type === "private_message") {
          mensagemElemento.classList.add("reservada");
          mensagemElemento.innerHTML = `
            <span class="hora">(${msg.time})</span> 
            <span class="usuario">${msg.from}</span> 
            <span class="reservado">reservadamente para ${msg.to}:</span> 
            <span class="texto">${msg.text}</span>
          `;
        } else {
          mensagemElemento.classList.add("normal");
          mensagemElemento.innerHTML = `
            <span class="hora">(${msg.time})</span> 
            <span class="usuario">${msg.from}</span> 
            <span class="destinatario">para ${msg.to}:</span> 
            <span class="texto">${msg.text}</span>
          `;
        }
        chat.appendChild(mensagemElemento);
      });
      
      const elementoQueQueroQueApareca = document.querySelector('.chat .mensagem:last-child');
      elementoQueQueroQueApareca.scrollIntoView({ behavior: 'smooth' });
    })
    .catch((error) => {
      console.error("Erro ao carregar mensagens:", error);
    });
}

function manterUsuarioConectado() {
  axios
    .post("https://mock-api.driven.com.br/api/v6/uol/status/91c6e8c3-62f7-4f3c-89a9-57906c19e160", { name: usuario })
    .then(() => {
      console.log(`Status de "${usuario}" mantido.`);
    })
    .catch((error) => {
      console.error("Erro ao manter o status do usuário:", error);
    });
}

function personalizarConversa(){
  const sidebar = document.querySelector(".sidebar");
  const cinza = document.querySelector(".cinza");
  sidebar.classList.toggle("escondido");
  cinza.classList.toggle("escondido");
}

function sairSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const cinza = document.querySelector(".cinza");
  sidebar.classList.add("escondido");
  cinza.classList.add("escondido");
}

function alternarVisibilidade(target) {
  const publico = document.querySelector(".publico .check");
  const reservado = document.querySelector(".reservado .check");
  const h1Baixo = document.querySelector(".baixo h1");

  if (target === "publico") {
    publico.classList.remove("escondido");
    reservado.classList.add("escondido");
    h1Baixo.textContent = "Enviando para Todos (público)";
  } else if (target === "reservado") {
    publico.classList.add("escondido");
    reservado.classList.remove("escondido");
    h1Baixo.textContent = "Enviando para Todos (reservadamente)";
  }
}

document.querySelector(".publico").addEventListener("click", () => {
  alternarVisibilidade("publico");
});

document.querySelector(".reservado").addEventListener("click", () => {
  alternarVisibilidade("reservado");
});

function carregarUsuariosOnline() {
  axios
    .get("https://mock-api.driven.com.br/api/v6/uol/participants/91c6e8c3-62f7-4f3c-89a9-57906c19e160")
    .then((response) => {
      const listaUsuarios = response.data;
      const onlineContainer = document.querySelector(".online");
      
      onlineContainer.innerHTML = "";
    
      const todosElemento = document.createElement("div");
      todosElemento.classList.add("usuario-online");
      todosElemento.innerHTML = `
        <ion-icon name="people"></ion-icon>
        <span>Todos</span>
        <ion-icon class="check ${destinatario === "Todos" ? "" : "escondido"}" name="checkmark-outline"></ion-icon>
      `;
      todosElemento.addEventListener("click", () => selecionarUsuario("Todos"));
      onlineContainer.appendChild(todosElemento);
      listaUsuarios.forEach((usuarioOnline) => {
        if (usuarioOnline.name === usuario) return;

        const usuarioElemento = document.createElement("div");
        usuarioElemento.classList.add("usuario-online");
        usuarioElemento.innerHTML = `
          <ion-icon name="person-circle"></ion-icon>
          <span>${usuarioOnline.name}</span>
          <ion-icon class="check ${destinatario === usuarioOnline.name ? "" : "escondido"}" name="checkmark-outline"></ion-icon>
        `;
        usuarioElemento.addEventListener("click", () => selecionarUsuario(usuarioOnline.name));
        onlineContainer.appendChild(usuarioElemento);
      });
    })
    .catch((error) => {
      console.error("Erro ao carregar usuários online:", error);
    });
  setInterval(carregarUsuariosOnline, 5000);
}

function selecionarUsuario(nome) {
  destinatario = nome; 
  atualizarTextoDestinatario();
  const checks = document.querySelectorAll(".online .check");
  checks.forEach((check) => check.classList.add("escondido"));
  const usuarios = document.querySelectorAll(".usuario-online");
  usuarios.forEach((usuario) => {
    const nomeUsuario = usuario.querySelector("span").textContent;
    if (nomeUsuario === nome) {
      usuario.querySelector(".check").classList.remove("escondido");
    }
  });
}

document.querySelector(".publico").addEventListener("click", () => {
  reservado = false;
  selecionarUsuario("Todos"); 
});

function alternarReservado() {
  reservado = !reservado; 
  atualizarTextoDestinatario();
}

function atualizarTextoDestinatario() {
  const h1Baixo = document.querySelector(".baixo h1");
  h1Baixo.textContent = `Enviando para ${destinatario} (${reservado ? "reservadamente" : "público"})`;
}

document.querySelector(".publico").addEventListener("click", () => {
  reservado = false;
  atualizarTextoDestinatario();
});

document.querySelector(".reservado").addEventListener("click", () => {
  reservado = true;
  atualizarTextoDestinatario();
});

carregarUsuariosOnline()
registrarUsuario();

