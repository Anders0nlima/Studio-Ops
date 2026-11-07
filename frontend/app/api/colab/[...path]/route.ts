import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const targetColab =
    request.headers.get('x-colab-url') ||
    request.nextUrl.searchParams.get('colabUrl') ||
    ''

  if (!targetColab) {
    return NextResponse.json(
      { error: 'Header x-colab-url ou query param colabUrl ausente.' },
      { status: 400 }
    )
  }

  const cleanTarget = targetColab.replace(/\/$/, '')
  const endpoint = `/${path.join('/')}`
  const targetUrl = `${cleanTarget}${endpoint}`

  try {
    const upstreamRes = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'StudioOps-Proxy/1.0',
      },
    })

    const contentType = upstreamRes.headers.get('content-type') || 'application/json'

    // If upstream is delivering a video, stream the binary
    if (contentType.includes('video') || endpoint.includes('/video/')) {
      const arrayBuffer = await upstreamRes.arrayBuffer()
      return new NextResponse(arrayBuffer, {
        status: upstreamRes.status,
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Length': String(arrayBuffer.byteLength),
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=3600',
        },
      })
    }

    // Otherwise JSON or text
    const text = await upstreamRes.text()
    if (text.includes('ERR_NGROK_3200') || text.includes('endpoint') && text.includes('offline')) {
      return NextResponse.json(
        {
          error: 'O túnel do Google Colab está offline (ERR_NGROK_3200). Verifique se a célula do Colab está em execução.',
          offline: true,
        },
        { status: 503 }
      )
    }

    try {
      const data = JSON.parse(text)
      return NextResponse.json(data, { status: upstreamRes.status })
    } catch {
      return new NextResponse(text, {
        status: upstreamRes.status,
        headers: { 'Content-Type': contentType },
      })
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: `Falha de conexão com o Colab: ${err.message}` },
      { status: 502 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const targetColab =
    request.headers.get('x-colab-url') ||
    request.nextUrl.searchParams.get('colabUrl') ||
    ''

  if (!targetColab) {
    return NextResponse.json(
      { error: 'Header x-colab-url ou query param colabUrl ausente.' },
      { status: 400 }
    )
  }

  const cleanTarget = targetColab.replace(/\/$/, '')
  const endpoint = `/${path.join('/')}`
  const targetUrl = `${cleanTarget}${endpoint}`

  try {
    const body = await request.json()
    const upstreamRes = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'StudioOps-Proxy/1.0',
      },
      body: JSON.stringify(body),
    })

    const text = await upstreamRes.text()
    try {
      const data = JSON.parse(text)
      return NextResponse.json(data, { status: upstreamRes.status })
    } catch {
      return new NextResponse(text, { status: upstreamRes.status })
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: `Falha ao despachar requisição para o Colab: ${err.message}` },
      { status: 502 }
    )
  }
}
