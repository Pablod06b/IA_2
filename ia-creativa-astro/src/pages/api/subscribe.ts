export const prerender = false; // Ensure this runs on the server

import type { APIRoute } from 'astro';
import { Resend } from 'resend';

const apiKey = import.meta.env.RESEND_API_KEY;

if (!apiKey) {
    console.error('❌ RESEND_API_KEY no está definida en las variables de entorno.');
}

const resend = new Resend(apiKey);

export const POST: APIRoute = async ({ request }) => {
    const data = await request.formData();
    const email = data.get('email');

    console.log(`[Subscribe API] Intento de suscripción: ${email}`);

    if (!email || typeof email !== 'string') {
        console.log('[Subscribe API] Email inválido o faltante');
        return new Response(
            JSON.stringify({ message: 'Email requerido' }),
            { status: 400 }
        );
    }

    try {
        // 0. Check for duplicates
        const fs = await import('node:fs');
        const path = await import('node:path');
        const logPath = path.join(process.cwd(), 'suscriptores.txt');

        if (fs.existsSync(logPath)) {
            const content = fs.readFileSync(logPath, 'utf-8');
            if (content.includes(email)) {
                console.log('[Subscribe API] Email duplicado detectado');
                return new Response(
                    JSON.stringify({ message: 'Este correo ya está añadido.' }),
                    { status: 409 } // Conflict
                );
            }
        }

        console.log('[Subscribe API] Enviando correo de bienvenida...');
        // 1. Send Welcome Email to the user
        const { data: welcomeData, error: welcomeError } = await resend.emails.send({
            from: 'IA Creativa <onboarding@resend.dev>', // Update this with your verified domain later
            to: email,
            subject: '¡Estás dentro! Bienvenido a la Vanguardia de la IA 🚀',
            html: `
        <h1>¡Hola Creador/a! 👋</h1>
        <p>Ya eres oficialmente parte de <strong>IA Creativa</strong>.</p>
        <p>Acabas de dar el paso para dejar de "jugar" con la IA y empezar a usarla para potenciar tu creatividad y tu negocio.</p>
        
        <p><strong>¿Qué puedes esperar a partir de ahora?</strong></p>
        <p>Cada semana recibirás en tu bandeja de entrada:</p>
        <ul>
            <li>🛠 <strong>Herramientas Secretas:</strong> Esas que nadie comparte pero que ahorran horas de trabajo.</li>
            <li>🧠 <strong>Prompts de Ingeniería:</strong> Para que ChatGPT, Claude o Gemini te den exactamente lo que buscas.</li>
            <li>📈 <strong>Estrategias de Monetización:</strong> Casos reales de cómo los creadores están ganando dinero con IA.</li>
        </ul>
        
        <p>No vamos a llenarte el correo de spam. Solo contenido de alto valor, directo al grano y 100% aplicable.</p>
        
        <p><strong>Para empezar con buen pie:</strong></p>
        <p>Echa un vistazo a nuestra comparativa más reciente (y polémica):<br>
        👉 <a href="https://tusitio.com/blog/chatgpt-vs-gemini-vs-claude-comparativa-2025">ChatGPT vs Gemini vs Claude 3: ¿Cuál deberías usar hoy?</a></p>
        
        <p>Nos vemos en el próximo correo.</p>
        
        <p>Un saludo,<br>
        <strong>El equipo de IA Creativa</strong></p>
        <hr>
        <p><em>PD: Si tienes alguna duda sobre una herramienta específica, responde a este correo. ¡Leemos todo!</em></p>
      `,
        });

        if (welcomeError) {
            console.error('[Subscribe API] Error enviando email de bienvenida:', welcomeError);
        } else {
            console.log('[Subscribe API] Email de bienvenida enviado con éxito:', welcomeData);
        }

        // 2. Send Notification to Admin (You)
        // Assuming you want to be notified at the same address or a specific admin one.
        // For now, I'll send it to the "from" address or a placeholder if you haven't set one up.
        // Ideally, add ADMIN_EMAIL to your .env
        const adminEmail = import.meta.env.ADMIN_EMAIL || 'tu-email@ejemplo.com';

        console.log(`[Subscribe API] Enviando notificación al admin: ${adminEmail}`);

        // 3. Save to local file (Simple Database)
        try {
            const fs = await import('node:fs');
            const path = await import('node:path');
            const logPath = path.join(process.cwd(), 'suscriptores.txt');
            const logEntry = `${new Date().toISOString()} - ${email}\n`;
            fs.appendFileSync(logPath, logEntry);
            console.log('[Subscribe API] Guardado en suscriptores.txt');
        } catch (err) {
            console.error('[Subscribe API] Error guardando en fichero local:', err);
            // Don't fail the request just because file logging failed
        }

        const { error: adminError } = await resend.emails.send({
            from: 'IA Creativa Bot <onboarding@resend.dev>',
            to: adminEmail,
            subject: '🚀 Nuevo Suscriptor en IA Creativa',
            html: `<p>El usuario <strong>${email}</strong> se ha suscrito a la newsletter.</p>`,
        });

        if (adminError) {
            console.error('[Subscribe API] Error enviando notificación al admin:', adminError);
        }

        return new Response(
            JSON.stringify({ message: '¡Suscripción exitosa!' }),
            { status: 200 }
        );
    } catch (error) {
        console.error('[Subscribe API] Error general:', error);
        return new Response(
            JSON.stringify({ message: 'Error al procesar la suscripción' }),
            { status: 500 }
        );
    }
};
