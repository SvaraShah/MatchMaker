import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sseManager } from '@/lib/sse';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { id: conversationId } = await params;
    const userId = session.userId;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (
      !conversation ||
      (conversation.participantAId !== userId && conversation.participantBId !== userId)
    ) {
      return new Response('Forbidden', { status: 403 });
    }

    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();

        const sendEvent = (event: string, data: any) => {
          try {
            controller.enqueue(
              encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
            );
          } catch {
            // Stream closed
          }
        };

        // Initial connection confirmation event
        sendEvent('connected', { conversationId, time: new Date().toISOString() });

        // Listener callback for new messages on this conversation
        const onMessage = (msgData: any) => {
          if (msgData.conversationId === conversationId) {
            sendEvent('message', msgData);
          }
        };

        sseManager.on('new_message', onMessage);

        request.signal.addEventListener('abort', () => {
          sseManager.removeListener('new_message', onMessage);
          try {
            controller.close();
          } catch {
            // Stream already closed
          }
        });
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('SSE Controller Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
