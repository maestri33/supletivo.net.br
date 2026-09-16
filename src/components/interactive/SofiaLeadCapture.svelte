<script lang="ts">
  import { onMount } from "svelte";
  import { maskBrPhone, onlyDigits } from "../../lib/phone";
  import { maskCpf, isValidCpf } from "../../lib/cpf";
  import { isEmailFormatValid, completeEmailWithDomain, POPULAR_EMAIL_DOMAINS } from "../../lib/email";

  type Step = "phone" | "cpf" | "email" | "payment" | "completed";

  interface Props {
    defaultRef?: string;
  }

  let { defaultRef = "" }: Props = $props();

  // State
  let step = $state<Step>("phone");
  let phone = $state("");
  let cpf = $state("");
  let email = $state("");
  let studentName = $state("");
  let paymentMethod = $state<"pix" | "card">("pix");
  let urlRef = $state("");
  let refCode = $derived(urlRef || defaultRef);

  // UI / Status states
  let isThinking = $state(false);
  let statusMessage = $state("");
  let copyFeedback = $state(false);
  let conflictAlert = $state<{ show: boolean; maskedPhone: string }>({ show: false, maskedPhone: "" });
  let cardRotX = $state(0);
  let cardRotY = $state(0);

  // Typewriter text state for Sofia
  let sofiaDialogue = $state("Olá! Sou a Sofia, sua orientadora no Supletivo Brasil. Para onde te envio seu plano personalizado e a liberação de matrícula?");

  // Derived calculations
  let phoneDigits = $derived(onlyDigits(phone));
  let cpfDigits = $derived(onlyDigits(cpf));
  let isCpfValid = $derived(isValidCpf(cpfDigits));
  let isEmailValid = $derived(isEmailFormatValid(email));

  onMount(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const val = params.get("ref");
      if (val) urlRef = val;
    }
  });

  // Handlers
  function onPhoneInput(e: Event) {
    const target = e.target as HTMLInputElement;
    phone = maskBrPhone(target.value);
    conflictAlert = { show: false, maskedPhone: "" };

    if (onlyDigits(phone).length === 11 && !isThinking) {
      advanceFromPhone();
    }
  }

  async function advanceFromPhone() {
    isThinking = true;
    statusMessage = "Consultando linha na Evolution API...";

    // Simulação do check na Evolution API + persistência prioritária do lead com ?ref=
    setTimeout(() => {
      isThinking = false;
      statusMessage = "";
      sofiaDialogue = "Perfeito! Seu WhatsApp foi confirmado e sua vaga está reservada. Agora, digite seu CPF para consultarmos seu histórico oficial:";
      step = "cpf";
      focusInput("cpf-input");
    }, 650);
  }

  function onCpfInput(e: Event) {
    const target = e.target as HTMLInputElement;
    cpf = maskCpf(target.value);
    conflictAlert = { show: false, maskedPhone: "" };

    if (onlyDigits(cpf).length === 11 && isValidCpf(onlyDigits(cpf)) && !isThinking) {
      advanceFromCpf();
    }
  }

  async function advanceFromCpf() {
    isThinking = true;
    statusMessage = "Localizando dados no sistema oficial...";

    setTimeout(() => {
      isThinking = false;
      statusMessage = "";

      // Cenário de teste: se o CPF terminar em "00", simula CPF já existente com outro número
      if (cpfDigits.endsWith("00")) {
        conflictAlert = {
          show: true,
          maskedPhone: "(11) •••••-9876",
        };
        sofiaDialogue = "Que bom ter você de volta! Encontramos seu cadastro anterior associado ao número protegido abaixo:";
        return;
      }

      // Enriquecimento com o nome completo oficial
      studentName = "MARIA APARECIDA DA SILVA";
      sofiaDialogue = `Que alegria ter você aqui, Maria Aparecida! Sua pré-matrícula foi emitida. Para onde enviamos a via oficial do seu certificado e nota fiscal?`;
      step = "email";
      focusInput("email-input");
    }, 700);
  }

  function onEmailInput(e: Event) {
    const target = e.target as HTMLInputElement;
    email = target.value;

    if (isEmailFormatValid(email) && !isThinking) {
      setTimeout(() => {
        advanceFromEmail();
      }, 400);
    }
  }

  function pickDomain(domain: string) {
    email = completeEmailWithDomain(email, domain);
    advanceFromEmail();
  }

  function advanceFromEmail() {
    isThinking = true;
    statusMessage = "Emitindo chave de matrícula...";

    setTimeout(() => {
      isThinking = false;
      statusMessage = "";
      sofiaDialogue = "Tudo pronto para sua formatura! Escolha agora a melhor forma para ativar seu acesso à sala de aula:";
      step = "payment";
    }, 550);
  }

  function copyPixCode() {
    const mockPix = "00020126580014br.gov.bcb.pix0136supletivo-brasil-pix-oficial5204000053039865404999.005802BR5925SUPLETIVO BRASIL LTDA6009SAO PAULO62070503***6304E8A2";
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(mockPix);
      copyFeedback = true;
      if ("vibrate" in navigator) navigator.vibrate(15);
      setTimeout(() => {
        copyFeedback = false;
      }, 2500);
    }
  }

  function focusInput(id: string) {
    setTimeout(() => {
      const el = document.getElementById(id);
      el?.focus();
    }, 50);
  }

  function goToStep(target: Step) {
    if (isThinking) return;
    conflictAlert = { show: false, maskedPhone: "" };
    step = target;
    if (target === "phone") {
      sofiaDialogue = "Ajuste seu WhatsApp para mantermos contato direto:";
      focusInput("phone-input");
    } else if (target === "cpf") {
      sofiaDialogue = "Atualize seu CPF para recalcularmos sua certidão de matrícula:";
      focusInput("cpf-input");
    } else if (target === "email") {
      sofiaDialogue = "Informe o e-mail onde deseja receber o comprovante e notas oficiais:";
      focusInput("email-input");
    }
  }

  // Tilt 3D suave no mouse move
  function handleMouseMove(e: MouseEvent) {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    cardRotX = -(y / 25);
    cardRotY = x / 25;
  }

  function handleMouseLeave() {
    cardRotX = 0;
    cardRotY = 0;
  }
</script>

<div class="relative w-full max-w-4xl mx-auto py-4 px-2 sm:px-4">
  <!-- Top Breadcrumbs / Pílulas de Edição Rápida (Desfazer sem botão Voltar) -->
  <div class="flex flex-wrap items-center justify-center gap-2 mb-6 text-xs">
    {#if phoneDigits.length === 11}
      <button
        type="button"
        onclick={() => goToStep("phone")}
        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 transition hover:bg-emerald-900/60 hover:border-emerald-400"
        title="Editar WhatsApp"
      >
        <span class="size-1.5 rounded-full bg-emerald-400"></span>
        <span class="font-mono">{phone}</span>
        <span class="text-[10px] text-emerald-400/80">✏️</span>
      </button>
    {/if}

    {#if isCpfValid}
      <button
        type="button"
        onclick={() => goToStep("cpf")}
        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/70 border border-blue-500/40 text-blue-300 transition hover:bg-blue-900/60 hover:border-blue-400"
        title="Editar CPF"
      >
        <span class="size-1.5 rounded-full bg-blue-400"></span>
        <span class="font-mono">{cpf}</span>
        <span class="text-[10px] text-blue-400/80">✏️</span>
      </button>
    {/if}

    {#if isEmailValid}
      <button
        type="button"
        onclick={() => goToStep("email")}
        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-500/40 text-purple-300 transition hover:bg-purple-900/60 hover:border-purple-400"
        title="Editar E-mail"
      >
        <span class="size-1.5 rounded-full bg-purple-400"></span>
        <span class="font-mono truncate max-w-[140px]">{email}</span>
        <span class="text-[10px] text-purple-400/80">✏️</span>
      </button>
    {/if}

    {#if refCode}
      <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-semibold text-amber-300">
        ★ Recomendado por: {refCode}
      </span>
    {/if}
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
    <!-- COLUNA DA ESQUERDA: A Credencial Holográfica 3D (The Credential Forger) -->
    <div class="lg:col-span-6 flex flex-col items-center">
      <!-- Container com perspectiva para o efeito 3D -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="w-full max-w-[380px] transition-transform duration-300 ease-out"
        style="perspective: 1000px;"
        onmousemove={handleMouseMove}
        onmouseleave={handleMouseLeave}
      >
        <div
          class="relative rounded-2xl p-6 shadow-2xl border backdrop-blur-xl overflow-hidden text-white select-none"
          style="
            transform: rotateX({cardRotX}deg) rotateY({cardRotY}deg);
            transform-style: preserve-3d;
            background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(11, 18, 32, 0.85) 100%);
            border-color: {step === 'payment' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255, 255, 255, 0.15)'};
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 35px -5px rgba(16, 185, 129, 0.15);
          "
        >
          <!-- Fundo decorativo com linhas de segurança e selo da República -->
          <div class="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div class="absolute -right-12 -bottom-12 size-48 rounded-full border border-yellow-400/10 pointer-events-none"></div>

          <!-- Cabeçalho Oficial -->
          <div class="flex items-center justify-between pb-3 border-b border-white/10">
            <div class="flex items-center gap-2">
              <div class="size-6 rounded bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-[10px] font-black text-emerald-300">
                BR
              </div>
              <span class="text-[11px] font-bold tracking-widest uppercase text-white/90">República Federativa do Brasil</span>
            </div>
            <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/70">MEC · CEE</span>
          </div>

          <!-- Corpo do Documento -->
          <div class="mt-4 flex items-start gap-4">
            <!-- Chip Holográfico da Evolution API -->
            <div class="relative size-12 rounded-lg bg-gradient-to-br from-amber-200/20 to-amber-600/30 border border-amber-300/40 p-1 flex flex-col justify-between shadow-inner">
              <div class="flex justify-between">
                <span class="size-2 rounded-full {phoneDigits.length === 11 ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-white/30'}"></span>
                <span class="size-2 rounded-full {isCpfValid ? 'bg-amber-300 shadow-[0_0_8px_#fde047]' : 'bg-white/30'}"></span>
              </div>
              <div class="text-[7px] font-mono font-bold text-center {phoneDigits.length === 11 ? 'text-emerald-300' : 'text-white/40'}">
                {phoneDigits.length === 11 ? 'EVOLUTION' : 'CHIP'}
              </div>
            </div>

            <!-- Dados Acadêmicos Principais -->
            <div class="flex-1 min-w-0">
              <p class="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Matrícula Pré-Aprovada</p>
              <h3 class="text-sm font-black text-white truncate tracking-tight">
                {studentName ? studentName : "IDENTIDADE ACADÊMICA"}
              </h3>
              <p class="text-[11px] text-white/70 mt-0.5">Ensino Médio Acelerado (EJA)</p>
            </div>
          </div>

          <!-- Dados Forjados em Tempo Real -->
          <div class="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <span class="text-[9px] uppercase text-white/50 block font-sans">Contato Validado</span>
              <span class="text-white font-semibold">{phone ? phone : "(00) 00000-0000"}</span>
            </div>
            <div>
              <span class="text-[9px] uppercase text-white/50 block font-sans">Documento CPF</span>
              <span class="text-white font-semibold">{cpf ? cpf : "000.000.000-00"}</span>
            </div>
          </div>

          <!-- Selo Oficial / Rodapé da Credencial -->
          <div class="mt-4 pt-3 border-t border-dashed border-white/10 flex items-center justify-between text-[10px]">
            <div class="flex items-center gap-1.5">
              <span class="size-2 rounded-full {step === 'payment' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}"></span>
              <span class="text-white/80 font-medium">
                {step === 'payment' ? 'Aguardando Ativação' : 'Documento em Emissão'}
              </span>
            </div>
            <span class="font-mono text-emerald-400 font-bold">100% ONLINE</span>
          </div>
        </div>
      </div>

      <p class="mt-3 text-[11px] text-white/50 text-center flex items-center justify-center gap-2">
        <span>🔒 Válido para Concursos, Faculdades e Empregos</span>
      </p>
    </div>

    <!-- COLUNA DA DIREITA: Sofia & The Smart Omnibar (Auto-Advance Zero-Button) -->
    <div class="lg:col-span-6 flex flex-col justify-center">
      <!-- Sofia Presence / Avatar bioluminescente -->
      <div class="flex items-center gap-3 mb-4">
        <div class="relative size-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-300 p-0.5 shadow-lg shadow-emerald-500/20">
          <div class="size-full rounded-full bg-slate-950 flex items-center justify-center">
            <span class="size-3.5 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse"></span>
          </div>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h4 class="text-sm font-bold text-white tracking-tight">Sofia</h4>
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Orientadora com IA
            </span>
          </div>
          <p class="text-[11px] text-white/60">Atendimento oficial Supletivo Brasil</p>
        </div>
      </div>

      <!-- Diálogo Interativo da Sofia -->
      <div class="rounded-2xl p-4 bg-white/5 border border-white/10 backdrop-blur-md mb-4 transition-all">
        <p class="text-sm font-medium text-white/95 leading-relaxed">
          "{sofiaDialogue}"
        </p>
        {#if statusMessage}
          <div class="mt-2 flex items-center gap-2 text-xs font-semibold text-emerald-400 animate-pulse">
            <span class="size-1.5 rounded-full bg-emerald-400"></span>
            <span>{statusMessage}</span>
          </div>
        {/if}
      </div>

      <!-- Alerta Acolhedor de Conflito de CPF (Caso de Contato Existente) -->
      {#if conflictAlert.show}
        <div class="rounded-2xl p-4 bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs mb-4 flex flex-col gap-2">
          <div class="flex items-center gap-2 font-bold text-amber-300">
            <span>🛡️ Acesso Seguro Reconhecido</span>
          </div>
          <p>
            Localizamos seu histórico no sistema com o celular <strong>{conflictAlert.maskedPhone}</strong>.
            Enviamos o código de segurança diretamente para lá.
          </p>
          <div class="flex gap-2 mt-1">
            <a
              href="https://app.supletivo.net.br/autenticacao/otp"
              class="px-3 py-1.5 rounded-lg bg-amber-400 text-black font-bold hover:bg-amber-300 transition text-center"
            >
              Digitar Código de Acesso →
            </a>
            <button
              type="button"
              onclick={() => goToStep("phone")}
              class="px-3 py-1.5 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition"
            >
              Usar outro número
            </button>
          </div>
        </div>
      {/if}

      <!-- THE MUTABLE SMART BAR (Auto-Advance sem botões convencionais) -->
      {#if step === "phone"}
        <div class="rounded-2xl p-4 bg-black/40 border border-white/15 shadow-xl transition-all focus-within:border-emerald-500/70 focus-within:ring-2 focus-within:ring-emerald-500/30">
          <label for="phone-input" class="block text-xs font-semibold text-white/70 mb-2">
            Digite seu WhatsApp para iniciar:
          </label>
          <div class="relative flex items-center">
            <span class="absolute left-4 text-emerald-400 text-lg">💬</span>
            <input
              id="phone-input"
              type="tel"
              inputmode="numeric"
              autocomplete="tel"
              placeholder="(11) 90000-0000"
              value={phone}
              oninput={onPhoneInput}
              disabled={isThinking}
              class="w-full pl-12 pr-4 py-3.5 bg-transparent text-lg font-bold text-white placeholder:text-white/25 focus:outline-none"
            />
            {#if phoneDigits.length === 11}
              <span class="absolute right-4 text-emerald-400 font-bold">✓</span>
            {/if}
          </div>
          <p class="mt-2 text-[11px] text-white/40 text-center">
            Avanço automático em 11 dígitos · Validação silenciosa na Evolution API
          </p>
        </div>
      {/if}

      {#if step === "cpf"}
        <div class="rounded-2xl p-4 bg-black/40 border border-white/15 shadow-xl transition-all focus-within:border-blue-500/70 focus-within:ring-2 focus-within:ring-blue-500/30">
          <label for="cpf-input" class="block text-xs font-semibold text-white/70 mb-2">
            Digite seu CPF para consulta cadastral:
          </label>
          <div class="relative flex items-center">
            <span class="absolute left-4 text-blue-400 text-lg">🪪</span>
            <input
              id="cpf-input"
              type="tel"
              inputmode="numeric"
              autocomplete="off"
              placeholder="000.000.000-00"
              value={cpf}
              oninput={onCpfInput}
              disabled={isThinking}
              class="w-full pl-12 pr-4 py-3.5 bg-transparent text-lg font-bold text-white placeholder:text-white/25 focus:outline-none"
            />
            {#if isCpfValid}
              <span class="absolute right-4 text-emerald-400 font-bold">✓</span>
            {/if}
          </div>
          <p class="mt-2 text-[11px] text-white/40 text-center">
            Validação Módulo 11 em tempo real · Enriquecimento de nome oficial
          </p>
        </div>
      {/if}

      {#if step === "email"}
        <div class="rounded-2xl p-4 bg-black/40 border border-white/15 shadow-xl transition-all focus-within:border-purple-500/70 focus-within:ring-2 focus-within:ring-purple-500/30">
          <label for="email-input" class="block text-xs font-semibold text-white/70 mb-2">
            Seu melhor e-mail para receber a documentação:
          </label>
          <div class="relative flex items-center">
            <span class="absolute left-4 text-purple-400 text-lg">✉️</span>
            <input
              id="email-input"
              type="email"
              inputmode="email"
              autocomplete="email"
              placeholder="nome@email.com"
              value={email}
              oninput={onEmailInput}
              disabled={isThinking}
              class="w-full pl-12 pr-4 py-3.5 bg-transparent text-base font-medium text-white placeholder:text-white/25 focus:outline-none"
            />
            {#if isEmailValid}
              <span class="absolute right-4 text-emerald-400 font-bold">✓</span>
            {/if}
          </div>

          <!-- Chips inteligentes de auto-complete de 1 toque -->
          <div class="mt-3 flex flex-wrap items-center gap-1.5">
            <span class="text-[10px] text-white/40 mr-1">Toque para completar:</span>
            {#each POPULAR_EMAIL_DOMAINS as dom (dom)}
              <button
                type="button"
                onclick={() => pickDomain(dom)}
                class="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono text-white/80 transition hover:bg-white/15 hover:border-purple-400 hover:text-white"
              >
                @{dom}
              </button>
            {/each}
          </div>
        </div>
      {/if}

      <!-- CENA 4: Os Dois Cards Esculturais Vivos de Pagamento -->
      {#if step === "payment"}
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- CARD PIX INSTANTÂNEO (Cybernetic Emerald) -->
          <button
            type="button"
            onclick={() => { paymentMethod = "pix"; }}
            class="group rounded-2xl p-4 text-left transition-all border {paymentMethod === 'pix' ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10' : 'bg-black/30 border-white/10 hover:border-white/25'}"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ⚡ Economia Máxima
              </span>
              <span class="text-[11px] font-bold text-emerald-400">-15% OFF</span>
            </div>
            <h5 class="text-sm font-extrabold text-white">PIX À Vista</h5>
            <div class="mt-2 flex items-baseline gap-1 text-emerald-400 font-extrabold">
              <span class="text-2xl font-black">R$ 999</span>
              <span class="text-[11px] text-white/60 line-through">R$ 1.615</span>
            </div>
            <p class="mt-1 text-[11px] text-white/70">Liberação imediata da sala de aula em 30 segundos.</p>
          </button>

          <!-- CARD CARTÃO DE CRÉDITO (Solar Titanium) -->
          <button
            type="button"
            onclick={() => { paymentMethod = "card"; }}
            class="group rounded-2xl p-4 text-left transition-all border {paymentMethod === 'card' ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/10' : 'bg-black/30 border-white/10 hover:border-white/25'}"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                💳 Parcelamento
              </span>
              <span class="text-[11px] font-bold text-amber-300">Sem Juros</span>
            </div>
            <h5 class="text-sm font-extrabold text-white">Cartão de Crédito</h5>
            <div class="mt-2 flex items-baseline gap-1 text-amber-400 font-extrabold">
              <span class="text-xs text-white/80">12x de</span>
              <span class="text-2xl font-black">R$ 99</span>
            </div>
            <p class="mt-1 text-[11px] text-white/70">Apenas R$ 3,30 ao dia para conquistar seu diploma.</p>
          </button>
        </div>

        <!-- Conteúdo Expansível do Método Selecionado -->
        <div class="mt-4 rounded-2xl p-5 bg-black/50 border border-white/15 backdrop-blur-xl">
          {#if paymentMethod === "pix"}
            <div class="flex flex-col items-center text-center gap-3">
              <div class="p-3 bg-white rounded-xl shadow-lg">
                <!-- QR Code SVG ilustrativo -->
                <svg class="size-32" viewBox="0 0 100 100" fill="none">
                  <rect width="100" height="100" fill="white" />
                  <path d="M10 10h30v30H10V10zm5 5v20h20V15H15zm45-5h30v30H60V10zm5 5v20h20V15H65zM10 60h30v30H10V60zm5 5v20h20V65H15zm45 5h10v10H60V70zm15 0h15v20H75V70zm-15 15h10v10H60V85zm30-40h-10v10h10V45zm-20 0h-10v10h10V45zm-10 10H40v10h10V55z" fill="#0b1220" />
                </svg>
              </div>

              <div class="w-full">
                <button
                  type="button"
                  onclick={copyPixCode}
                  class="w-full py-3 px-4 rounded-xl bg-emerald-500 font-extrabold text-black hover:bg-emerald-400 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
                >
                  {#if copyFeedback}
                    <span>✓ Chave Pix Copiada com Sucesso!</span>
                  {:else}
                    <span>Copiar Chave Pix (Copia e Cola)</span>
                  {/if}
                </button>
                <p class="mt-2 text-[11px] text-white/60">
                  Abra o aplicativo do seu banco, escolha "Pix Copia e Cola" e confirme.
                </p>
              </div>
            </div>
          {:else}
            <!-- Formulário Contínuo de Cartão -->
            <div class="flex flex-col gap-3">
              <div>
                <label for="card-num" class="block text-xs font-medium text-white/70 mb-1">Número do Cartão</label>
                <input
                  id="card-num"
                  type="text"
                  inputmode="numeric"
                  placeholder="0000 0000 0000 0000"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono placeholder:text-white/20 focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label for="card-exp" class="block text-xs font-medium text-white/70 mb-1">Validade (MM/AA)</label>
                  <input
                    id="card-exp"
                    type="text"
                    inputmode="numeric"
                    placeholder="12/28"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono placeholder:text-white/20 focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label for="card-cvv" class="block text-xs font-medium text-white/70 mb-1">CVV</label>
                  <input
                    id="card-cvv"
                    type="text"
                    inputmode="numeric"
                    placeholder="123"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono placeholder:text-white/20 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
              <a
                href="https://app.supletivo.net.br/autenticacao/otp"
                class="w-full mt-2 py-3 px-4 rounded-xl bg-amber-400 font-extrabold text-black hover:bg-amber-300 transition text-center shadow-lg shadow-amber-400/25"
              >
                Concluir Matrícula em 12x de R$ 99 →
              </a>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>
