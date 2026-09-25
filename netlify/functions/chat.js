exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Método não permitido." })
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "A chave OPENAI_API_KEY não está configurada no Netlify."
      })
    };
  }

  let body;

  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Mensagem inválida." })
    };
  }

  const message =
    typeof body.message === "string" ? body.message.trim() : "";

  if (!message) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Escreva uma pergunta." })
    };
  }

  if (message.length > 4000) {
    return {
      statusCode: 413,
      headers,
      body: JSON.stringify({ error: "Mensagem muito longa." })
    };
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "Você é o assistente do Conecta TEA. Responda em português brasileiro, com acolhimento, respeito e linguagem simples. Divida as orientações em passos curtos e claros. Não presuma que todas as pessoas autistas são iguais. Não diagnostique nem substitua profissionais. Nunca solicite senhas, documentos, endereço ou dados bancários."
            },
            {
              role: "user",
              content: message
            }
          ],
          temperature: 0.5,
          max_tokens: 700
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({
          error: data?.error?.message ||
            "Erro ao conectar com a OpenAI."
        })
      };
    }

    const reply =
      data?.choices?.[0]?.message?.content?.trim();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        reply: reply || "Não recebi uma resposta."
      })
    };

  } catch (error) {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({
        error: "Falha ao conectar com a OpenAI."
      })
    };
  }
};
3. Salve o arquivo

Role a página para cima.

Toque em Commit changes.

Confirme que está salvando diretamente na branch main.

Depois me envie uma captura de tela.

Não coloque sua chave secreta da OpenAI nesse código. Ela deve continuar somente nas variáveis de ambiente do Netlify.
