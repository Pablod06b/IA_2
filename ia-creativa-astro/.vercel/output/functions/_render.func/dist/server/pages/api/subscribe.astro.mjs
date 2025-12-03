import { Resend } from 'resend';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const resend = new Resend(undefined                              );
const POST = async ({ request }) => {
  const data = await request.formData();
  const email = data.get("email");
  if (!email || typeof email !== "string") {
    return new Response(
      JSON.stringify({ message: "Email requerido" }),
      { status: 400 }
    );
  }
  try {
    await resend.emails.send({
      from: "IA Creativa <onboarding@resend.dev>",
      // Update this with your verified domain later
      to: email,
      subject: "¡Bienvenido a IA Creativa!",
      html: `
        <h1>¡Gracias por suscribirte!</h1>
        <p>Te damos la bienvenida a la comunidad de creadores que usan IA.</p>
        <p>Pronto recibirás las mejores guías y herramientas directamente en tu bandeja de entrada.</p>
      `
    });
    const adminEmail = undefined                            || "tu-email@ejemplo.com";
    await resend.emails.send({
      from: "IA Creativa Bot <onboarding@resend.dev>",
      to: adminEmail,
      subject: "🚀 Nuevo Suscriptor en IA Creativa",
      html: `<p>El usuario <strong>${email}</strong> se ha suscrito a la newsletter.</p>`
    });
    return new Response(
      JSON.stringify({ message: "¡Suscripción exitosa!" }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "Error al procesar la suscripción" }),
      { status: 500 }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    POST,
    prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
