import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Hook para manejar la cámara del dispositivo con getUserMedia: pide
 * permiso, muestra una vista previa en vivo (preferiendo la cámara
 * trasera en móviles), permite capturar un fotograma como Blob JPEG,
 * y libera siempre las pistas de video al detener o desmontar.
 *
 * @returns {{
 *   videoRef: React.RefObject<HTMLVideoElement>,
 *   activa: boolean,
 *   iniciando: boolean,
 *   error: string,
 *   iniciar: () => Promise<void>,
 *   detener: () => void,
 *   capturarFoto: () => Promise<Blob>,
 * }}
 */
export const useCamera = () => {
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const [activa, setActiva] = useState(false)
  const [iniciando, setIniciando] = useState(false)
  const [error, setError] = useState('')

  const detener = useCallback(() => {
    streamRef.current?.getTracks().forEach((pista) => pista.stop())
    streamRef.current = null
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setActiva(false)
  }, [])

  const iniciar = useCallback(async () => {
    setError('')
    setIniciando(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setActiva(true)
    } catch (errorCaptura) {
      if (
        errorCaptura.name === 'NotAllowedError' ||
        errorCaptura.name === 'PermissionDeniedError'
      ) {
        setError(
          'Se denegó el permiso de cámara. Autorice el acceso desde el navegador para continuar.',
        )
      } else if (errorCaptura.name === 'NotFoundError') {
        setError('No se encontró ninguna cámara disponible en este dispositivo.')
      } else {
        setError('No se pudo iniciar la cámara. Intente nuevamente.')
      }
      setActiva(false)
    } finally {
      setIniciando(false)
    }
  }, [])

  const capturarFoto = useCallback(() => {
    return new Promise((resolve, reject) => {
      const video = videoRef.current
      if (!video || !streamRef.current) {
        reject(new Error('La cámara no está activa.'))
        return
      }

      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const contexto = canvas.getContext('2d')
      contexto.drawImage(video, 0, 0, canvas.width, canvas.height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('No se pudo capturar la imagen.'))
          }
        },
        'image/jpeg',
        0.92,
      )
    })
  }, [])

  // Libera la cámara siempre que el componente se desmonte o se cambie de vista.
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((pista) => pista.stop())
      streamRef.current = null
    }
  }, [])

  return { videoRef, activa, iniciando, error, iniciar, detener, capturarFoto }
}
