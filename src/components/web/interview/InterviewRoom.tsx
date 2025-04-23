import React, { useEffect, useRef, useState } from 'react'
import think from '../../../assets/think.svg'
import { BsFillRecordFill } from 'react-icons/bs'
import { IoMdHelpCircleOutline } from 'react-icons/io'
import { Button } from 'src/components/ui/button'
import { RxExit } from 'react-icons/rx'
import Webcam from 'react-webcam'
import {
  generateSignedAzureLinkService,
  getQuestion,
  getTextFromAudio,
  nextQuestion,
  sendAnswer,
  submitInterview,
  updateStatus,
  updateTabSwitch,
  uploadVideoAzure
} from 'src/service/Interview'
import { IMessage } from 'types'
import {
  INTERVIEW_MAX_IDLE_COUNT,
  ISessionStatus,
  progressConstants,
  Server,
  VideoConstants,
  videoConstraints
} from 'src/constant/staticData'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from 'src/components/ui/dialog'
import { getUserInitials } from 'src/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from 'src/components/ui/avatar'
import aiImage from '../../../assets/image22.png'
import aiImage2 from '../../../assets/ai_image.svg'
import { BiBarChart } from 'react-icons/bi'
import { Slider } from 'src/components/ui/slider'
import Thankyou from 'src/components/Thankyou'
import { ScrollArea } from 'src/components/ui/scroll-area'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { TbSpace } from 'react-icons/tb'
import { LoadingSpinner } from 'src/components/Loader'
import { ProgressBar } from 'primereact/progressbar'
import { BlobServiceClient } from '@azure/storage-blob'
import AgoraRTC, {
  IAgoraRTCClient,
  ILocalAudioTrack,
  ILocalVideoTrack,
  IMicrophoneAudioTrack,
  UID
} from 'agora-rtc-sdk-ng'
import { U } from 'react-router/dist/development/fog-of-war-CCAcUMgB'
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext
  }
}

export default function InterviewRoom () {
  const initialized = useRef<any>(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaRecorderRef1 = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<any>(null)
  const videoRef = useRef<Webcam | null>(null)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const videoRecordBlob = useRef(recordedBlob)
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [msgs, setMsgs] = useState<IMessage[]>([])
  const [speach, setSpeach] = useState<boolean>(false)
  const secRef = useRef(0)
  const [progress, setProgress] = React.useState<number>(0.05)
  const [elapsedTime, setElapsedTime] = useState(0)
  const timerRef = useRef<any>(null)
  const [idleCount, setIdleCount] = useState(0)
  const [exitModel, setExitModel] = useState(false)
  const [switchCount, setSwitchCount] = useState(0)
  const [userName, setUsername] = useState('')
  const [positionName, setPositionName] = useState('')
  const [showThanku, setShowThanku] = useState(false)
  const [loading, setLoading] = useState('')
  const [loader, setLoader] = useState(false)
  const [intervwStatus, setIntervStatus] = useState(false)
  const intervwStatusRef = useRef(intervwStatus)
  const navigate = useNavigate()
  const scrollRef = useRef<any>(null)
  const [subLoader, setSubLoader] = useState(false)
  const [proLoader, setProLoader] = useState(false)
  const [interviewStatus, setInterviewStatus] = useState<number>()
  const interviewStatusRef = useRef(interviewStatus)
  const pausedTime = useRef(0)
  const elapsedTimeRef = useRef(0)

  const [agoraClient, setAgoraClient] = useState<IAgoraRTCClient | null>(null)
  const [localScreenTrack, setLocalScreenTrack] =
    useState<ILocalVideoTrack | null>(null)
  const [localAudioTrack, setLocalAudioTrack] =
    useState<ILocalAudioTrack | null>(null)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [destinationNode, setDestinationNode] =
    useState<MediaStreamAudioDestinationNode | null>(null)

  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  }
  const authtoken = getAuthToken()

  const api = process.env.REACT_APP_API_ENDPOINT
  const appId = process.env.REACT_APP_AGORA_APP_ID || ''
  
  const [sid, setSid] = useState<string>('')
  let UID = localStorage.getItem('userUID') || ''
  let channel = `interview-${UID}`
  let agoraToken = localStorage.getItem('agoraToken')
 
  useEffect(() => {
    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
    setAgoraClient(client)

    return () => {
      if (client) {
        client.leave()
      }
      stopScreenSharing()
    }
  }, [])

  const startRecording = async () => {
    try {
      UID = `${Math.floor(100000 + Math.random() * 900000)}`
      channel = `interview-${UID}`
      localStorage.setItem('userUID', UID.toString())

      const tokenResponse = await fetch(
        `${api}/agoraToken`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...(authtoken ? { Authorization: `Bearer ${authtoken}` } : {})
          },
          body: JSON.stringify({ uid: UID, channelName: channel }) // ✅ Fix here
        }
      )

      const tokenData = await tokenResponse.json()

      if (tokenResponse.ok && tokenData.agoraToken) {
        localStorage.setItem('agoraToken', tokenData.agoraToken)
        agoraToken = tokenData.agoraToken
      } else {
        toast.error('Failed to fetch Agora token.')
      }

      if(!agoraClient) {
        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
        setAgoraClient(client)
      }

      // if (agoraClient && !isScreenSharing) {
      //   // alert('Agora client is not initialized')
      //   const response = await agoraClient.join(appId, channel, agoraToken, UID)
      //   console.log(response, 'Agora client joined')

      //   // const audioTrack = await AgoraRTC.createMicrophoneAndCameraTracks()

      //   const audioTrack = await AgoraRTC.createScreenVideoTrack({
      //     encoderConfig: '1080p_1', // or '720p', '480p', etc.
      //     optimizationMode: 'detail', // or 'motion'
      //   },'enable');


      //   // setLocalAudioTrack(audioTrack)
      //   await agoraClient.publish(audioTrack)
      // }

    
      if (agoraClient && !isScreenSharing) {
        await agoraClient.join(appId, channel, agoraToken, UID)
        console.log('Agora client joined')

        const screenTrack = await AgoraRTC.createScreenVideoTrack(
          {
            encoderConfig: '1080p_1',
            optimizationMode: 'detail',
          },
          'auto' // can be 'enable' or 'auto'
        )
        
        let videoTrack: ILocalVideoTrack
        let systemAudioTrack: ILocalAudioTrack | null = null
        
        if (Array.isArray(screenTrack)) {
          videoTrack = screenTrack[0]
          systemAudioTrack = screenTrack[1] // system audio
        } else {
          videoTrack = screenTrack
        }
        
        const micTrack: IMicrophoneAudioTrack = await AgoraRTC.createMicrophoneAudioTrack()
        
        const tracksToPublish: (ILocalVideoTrack | IMicrophoneAudioTrack | ILocalAudioTrack)[] = [videoTrack, micTrack]
        
        if (systemAudioTrack) {
          tracksToPublish.push(systemAudioTrack)
        }
        
        await agoraClient.publish(tracksToPublish)
      }

      // const micStream = await navigator.mediaDevices.getUserMedia({
      //   audio: {
      //     echoCancellation: true,
      //     noiseSuppression: true,
      //     autoGainControl: true
      //   }
      // })

      // const micSource = audioCtx.createMediaStreamSource(micStream)

      // micSource.connect(destination)

      // const screenStream = await navigator.mediaDevices.getDisplayMedia({
      //   video: true,
      //   audio: true
      // })

      // if (screenStream.getAudioTracks().length > 0) {
      //   const systemAudioSource = audioCtx.createMediaStreamSource(screenStream)
      //   systemAudioSource.connect(destination)
      // }

      // screenStream.getTracks().forEach(track => {
      //   track.onended = () => {
      //     // stopRecording()
      //   }
      // })

      // const combinedStream = new MediaStream([
      //   ...screenStream.getVideoTracks(),
      //   ...destination.stream.getAudioTracks()
      // ])

      // if (videoRef.current) {
      //   videoRef.current.stream = combinedStream
      // }

      // const options = { mimeType: 'video/webm;codecs=vp9' }
      // const mediaRecorder = new MediaRecorder(combinedStream, options)

      // mediaRecorderRef1.current = mediaRecorder

      let chunks1: BlobPart[] = []
      // mediaRecorder.ondataavailable = (event) => {
      //   if (event.data.size > 0) {
      //     chunks1.push(event.data);
      //   }
      // };

      // mediaRecorder.ondataavailable = async event => {
      //   if (event.data.size > 0) {
      //     const blob = new Blob([event.data], { type: 'video/webm' })
      //     // await uploadChunkToAzure(blob) // upload each 30 sec chunk
      //     chunks1.push(event.data) // optional: keep for full video
      //   }
      // }

      // mediaRecorder.onstop = () => {
      //   if (
      //     interviewStatusRef.current === ISessionStatus.InterviewStarted ||
      //     interviewStatusRef.current === ISessionStatus.InterviewResumed
      //   ) {
      //     setInterviewStatus(ISessionStatus.InterviewPaused)
      //   }

      //   if (chunks1.length) {
      //     const blob = new Blob(chunks1, { type: VideoConstants.FileType })
      //     setRecordedBlob(blob)
      //     chunks1 = []
      //   }

      //   if (audioContext) {
      //     // audioContext.close()
      //     setAudioContext(null)
      //     setDestinationNode(null)
      //   }
      // }

      // // mediaRecorder.start(30000);
      // mediaRecorder.start() // Start recording in chunks of 30 seconds

      
      setIsRecording(true)
      setIsScreenSharing(true)

      if (!timerRef.current) {
        const startTime = Date.now() - pausedTime.current * 1000
        timerRef.current = setInterval(() => {
          const elapsed = Math.floor((Date.now() - startTime) / 1000)
          setElapsedTime(elapsed)
        }, 1000)
      }

      if (interviewStatusRef.current === ISessionStatus.InterviewNotStarted) {
        setInterviewStatus(ISessionStatus.InterviewStarted)
      }
    } catch (err) {
      console.log(err)
      setInterviewStatus(ISessionStatus.InterviewPaused)
    }

    // Step 1: Call acquire API before joining and recording
    const acquireResponse = await fetch(
      `${api}/acquire`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(authtoken ? { Authorization: `Bearer ${authtoken}` } : {})
        },

        body: JSON.stringify({
          channel: channel,
          uid: UID
        })
      }
    )
    const acquireData = await acquireResponse.json()
    if (!acquireResponse.ok) {
      throw new Error('Failed to acquire Agora resource')
    }
    const resourceId = acquireData.resourceId

    localStorage.setItem('resourceId', resourceId)
    // Step 2: Start cloud recording using the acquired resourceId
    const startCloudResponse = await fetch(`${api}/start`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(authtoken ? { Authorization: `Bearer ${authtoken}` } : {})
      },
      body: JSON.stringify({
        resourceId,
        channel,
        uid: UID,
        agoraToken
      })
    })

    const startData = await startCloudResponse.json()

    if (!startCloudResponse.ok || !startData.sid) {
      throw new Error('Failed to start cloud recording')
    }

    setSid(startData.sid) // Save SID to state
    localStorage.setItem('sid', startData.sid)

    // ✨ Call queryRecording after 4-5 seconds
    setTimeout(async () => {
      try {
        const queryResponse = await fetch(`${api}/query`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...(authtoken ? { Authorization: `Bearer ${authtoken}` } : {})
          },
          body: JSON.stringify({
            resourceId: resourceId,
            sid: localStorage.getItem('sid')
          })
        })

        const data = await queryResponse.json()
        if (queryResponse.ok) {
          console.log('Queried recording info:', data)
        } else {
          console.warn('Query recording returned an error:', data)
        }
      } catch (err) {
        console.error('Error querying recording:', err)
      }
    }, 5000)
  }

  const stopScreenSharing = async () => {
    if (!isScreenSharing) return

    try {
      if (mediaRecorderRef1.current?.state !== 'inactive') {
        mediaRecorderRef1.current?.stop()
      }

      if (localScreenTrack) {
        if (agoraClient) await agoraClient.unpublish(localScreenTrack)
        localScreenTrack.stop()
        localScreenTrack.close()
        setLocalScreenTrack(null)
      }

      if (localAudioTrack) {
        if (agoraClient) await agoraClient.unpublish(localAudioTrack)
        localAudioTrack.stop()
        localAudioTrack.close()
        setLocalAudioTrack(null)
      }

      if (videoRef.current && videoRef.current.stream) {
        videoRef.current.stream.getTracks().forEach(track => {
          if (track.readyState === 'live') {
            track.stop()
          }
        })
      }

      // ✅ Dummy payload for exit interview
      const dummyPayload = {
        duration: elapsedTime,
        feedback: 'Great interview experience!',
        type: 'exit',
        rating: 5
      }

      // ✅ Call submitInterview with dummy data
      const submitRes = await submitInterview(dummyPayload)

      if (submitRes.success) {
        setTimeout(() => {
          navigate('/thankyou')
        }, 2000)
        // ✅ Call Azure link generator
        // const getAzureStorageLink = await generateSignedAzureLinkService();

        // if (getAzureStorageLink.success) {
        //   const { url, name } = getAzureStorageLink.data;

        //   setTimeout(() => {
        //     navigate('/thankyou');
        //   }, 2000);
        // } else {
        //   toast.error('Failed to get Azure link');
        // }
      } else {
        toast.error('Failed to submit interview')
      }

      if (audioContext) {
        // audioContext.close()
        setAudioContext(null)
        setDestinationNode(null)
      }

      setIsRecording(false)
    } catch (error) {
      console.error('Error stopping screen sharing:', error)
      toast.error('Failed to stop recording')
    } finally {
      setIsUploading(false)
    }
  }

  const stopRecording = async () => {
    // Stop MediaRecorder if it's still recording
    if (
      mediaRecorderRef1.current &&
      mediaRecorderRef1.current.state === 'recording'
    ) {
      // Stop the timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
        pausedTime.current = elapsedTimeRef.current
        timerRef.current = null
      }

      // Stop the actual media recorder
      mediaRecorderRef1.current.stop()
      setIsRecording(false)

      // Stop screen sharing if enabled
      if (isScreenSharing) {
        stopScreenSharing()
      }
    }
    const resourceId = localStorage.getItem('resourceId')
    const sid = localStorage.getItem('sid')
    // Make sure you have these values before calling the API
    if (!resourceId || !sid || !channel) {
      alert('Recording not started yet or missing info')
      return
    }

    // Call backend API to stop Agora Cloud Recording and upload to S3
    try {
      const response = await fetch(`${api}/stop`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(authtoken ? { Authorization: `Bearer ${authtoken}` } : {})
        },
        body: JSON.stringify({
          resourceId,
          sid: localStorage.getItem('sid'),
          channel,
          uid: UID
        })
      })

      if (response.ok) {
        stopScreenSharing()
        setIsScreenSharing(false)
      }
      if (!response.ok) {
        throw new Error('Failed to stop recording')
      }

      const data = await response.json()
      console.log('Recording stopped and uploaded:', data)
      toast.success('Recording uploaded successfully!')
      // alert('Recording stopped successfully. Files uploaded to S3.')
    } catch (error) {
      console.error('Stop recording error:', error)
      alert('Failed to stop recording')
    }
  }

  useEffect(() => {
    if (
      interviewStatus === ISessionStatus.InterviewCompleted ||
      interviewStatus === ISessionStatus.InterviewIncomplete
    ) {
      stopScreenSharing()
    }
  }, [interviewStatus])

  const [audioUrl, setAudioUrl] = useState<any>('')
  let chunks: Blob[] = []
  let chunks1: Blob[] = []
  const [audioBlobUrl, setAudioBlobUrl] = useState<any>()

  useEffect(() => {
    // Cleanup the timer when the component unmounts
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    elapsedTimeRef.current = elapsedTime
  }, [elapsedTime])

  useEffect(() => {
    if (!initialized.current) {
      const username = localStorage.getItem('username') || ''
      const positionInfo = localStorage.getItem('positionInfo') || ''
      setPositionName(positionInfo)
      setUsername(username)
      if (!showThanku) {
        setInterviewStatus(ISessionStatus.InterviewNotStarted)
      }
      initialized.current = true
    }
  }, [])

  useEffect(() => {
    if (audioUrl) {
      const audioElement = audioRef.current
      if (audioElement) {
        audioElement.play()
      }
    }
  }, [audioUrl])

  useEffect(() => {
    if (!speach) {
      secRef.current = 0
      return () => {}
    } else {
      const timeoutID = window.setInterval(() => {
        secRef.current = secRef.current + 1
        if (secRef.current > 300) {
          updateIdleTimeForUserReply()
          secRef.current = 0
        }
      }, 1000)
      return () => window.clearTimeout(timeoutID)
    }
  }, [speach])

  useEffect(() => {
    intervwStatusRef.current = intervwStatus
  }, [intervwStatus])

  useEffect(() => {
    const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
      if (!sessionStorage.getItem('isTabClosed')) {
        sessionStorage.setItem('isTabClosed', 'true')
        e.preventDefault()
        e.returnValue = 'Are you sure you want to leave?'
        return 'Are you sure you want to leave?'
      }
      setInterviewStatus(ISessionStatus.InterviewIncomplete)
      updateInterviewStatus()
    }

    window.addEventListener('beforeunload', beforeUnloadHandler)
    return () => {
      window.removeEventListener('beforeunload', beforeUnloadHandler)
      sessionStorage.removeItem('isTabClosed') // Clean up after component unmounts
    }
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [msgs])

  useEffect(() => {
    const handleVisibilityChange = (event: any) => {
      if (document.hidden) {
        setSwitchCount(c => c + 1)
        event.stopPropagation()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [switchCount])

  useEffect(() => {
    if (switchCount > 0) {
      updateCount()
    }
  }, [switchCount])

  useEffect(() => {
    videoRecordBlob.current = recordedBlob
  }, [recordedBlob])

  const updateIdleTimeForUserReply = () => {
    setIdleCount(idleCount + 1)
    if (idleCount <= INTERVIEW_MAX_IDLE_COUNT) {
      const msg: IMessage = {
        msg: 'Hey, I am waiting for your response. If you need any clarifications, please let me know',
        name: 'Ann',
        type: Server.Server,
        time: new Date().toLocaleString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      }
      setMsgs(prev => [...prev, msg])
    } else if (idleCount === INTERVIEW_MAX_IDLE_COUNT + 1) {
      const msg: IMessage = {
        msg: 'Hey, there is a delay in your responses. Request you to respond promptly. Further delay or one more instance of delay could result in termination of our discussion',
        name: 'Ann',
        type: Server.Server,
        time: new Date().toLocaleString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      }
      setMsgs(prev => [...prev, msg])
    } else if (idleCount === INTERVIEW_MAX_IDLE_COUNT + 2) {
      setInterviewStatus(ISessionStatus.InterviewIncomplete)
      updateInterviewStatus()
    }
  }

  const getInterviewQuestion = async () => {
    try {
      const response: any = await getQuestion()
      if (response.success) {
        setSpeach(false)
        setProLoader(false)
        //const audioBlob = base64ToBlob(response.data.audio);
        // setAudioBlobUrl(URL.createObjectURL(audioBlob));
        const blob = new Blob([response.data.audio], { type: 'audio/wav' })
        const audioUrl = URL.createObjectURL(blob)
        setAudioUrl(audioUrl)
        setMsgs(prev => [
          ...prev,
          {
            msg: response.data.text,
            name: 'Ann',
            type: Server.Server,
            time: new Date().toLocaleString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })
          }
        ])
      } else {
        toast.error('Something went wrong .Please try again later')
      }
    } catch (error) {
      toast.error('Something went wrong .Please try again later')
    }
  }

  const sendUserAnswer = async (text: string) => {
    if (text) {
      setMsgs(prev => [
        ...prev,
        {
          msg: text,
          name: userName,
          type: Server.User,
          time: new Date().toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })
        }
      ])
      setSpeach(false)
    }

    try {
      setProLoader(true)
      const nextQnresponse = await nextQuestion({ answer: text })
      setSubLoader(false)
      setProLoader(false)
      if (nextQnresponse.success) {
        //const audioBlob = base64ToBlob(nextQnresponse.data.audio);
        // setAudioBlobUrl(URL.createObjectURL(audioBlob));
        const blob = new Blob([nextQnresponse.data.audio], {
          type: 'audio/wav'
        })
        const audioUrl = URL.createObjectURL(blob)
        setAudioUrl(audioUrl)
        setMsgs(prev => [
          ...prev,
          {
            msg: nextQnresponse.data.text,
            name: 'Ann',
            type: Server.Server,
            time: new Date().toLocaleString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })
          }
        ])
        if (
          nextQnresponse.data.section &&
          [
            'ice_breaker',
            'relevance',
            'technical',
            'competency',
            'logistical'
          ].includes(nextQnresponse.data.section)
        ) {
          setProgress(progressConstants[nextQnresponse.data.section] * 100)
        }

        if (
          nextQnresponse.data.text ===
          'The interview is now complete, it was a pleasure talking to you.'
        ) {
          setIntervStatus(true)
          setInterviewStatus(ISessionStatus.InterviewCompleted)
          setTimeout(() => {
            setShowThanku(true)
            setLoading('loading')
            // uploadFile(true , true);
          }, 8000)
        }
      } else {
        toast.error('Something went wrong')
      }
    } catch (error) {
      console.log(error)
    }
  }

  const startAudioRecording = async () => {
    setSpeach(true)
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorderRef.current = new MediaRecorder(stream)

    mediaRecorderRef.current.ondataavailable = e => {
      chunks.push(e.data)
    }

    mediaRecorderRef.current.onstop = async () => {
      try {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' })
        chunks = []
        const formData = new FormData()
        formData.append('audio', audioBlob, 'recording.wav')
        const res = await getTextFromAudio(formData)
        if (res.data.transcript && res.data.transcript !== '') {
          sendUserAnswer(res.data.transcript)
        } else {
          sendUserAnswer('error: empty answer by user')
        }
      } catch (err) {
        sendUserAnswer('error: empty answer by user')
        console.error(err)
      }
    }
    mediaRecorderRef.current.start(500)
  }

  const stopAudioRecording = async () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'recording'
    ) {
      mediaRecorderRef.current.stop()
    }
  }

  useEffect(() => {
    interviewStatusRef.current = interviewStatus
    if (
      interviewStatus === ISessionStatus.InterviewNotStarted ||
      interviewStatus === ISessionStatus.InterviewResumed
    ) {
      startRecording()
    } else if (
      interviewStatus === ISessionStatus.InterviewCompleted ||
      interviewStatus === ISessionStatus.InterviewIncomplete
    ) {
      stopRecording()
    }
    return () => {}
  }, [interviewStatus])

  useEffect(() => {
    if (interviewStatus === ISessionStatus.InterviewStarted) {
      getInterviewQuestion()
    }
  }, [interviewStatus])

  const formatTime = (seconds: any) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${hours < 10 ? '0' : ''}${hours}:${
      minutes < 10 ? '0' : ''
    }${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
  }

  const updateInterviewStatus = async () => {
    try {
      setExitModel(false)
      setSpeach(false)
      setShowThanku(true)
      setLoading('loading')
      // stopRecording()

      if (videoRef.current && videoRef.current.stream) {
        const stream = videoRef.current.stream
        stream.getTracks().forEach(track => {
          if (track.readyState === 'live') {
            track.stop()
          }
        })
      }
      if (mediaRecorderRef1.current && mediaRecorderRef1.current.stream) {
        const stream = mediaRecorderRef1.current.stream
        stream.getTracks().forEach(track => {
          track.stop()
        })
      }

      setTimeout(() => {
        navigate('/thankyou', { replace: true })
      }, 2000)
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  const updateCount = async () => {
    try {
      const updateSwitch = await updateTabSwitch()
      if (!updateSwitch.success) {
        console.error(updateSwitch)
      }
    } catch (error) {
      console.error(error)
    }
  }

  // const uploadFile = async (interviewStatus: boolean, isFinal = false) => {
  //   clearInterval(timerRef.current)
  //   if (videoRecordBlob.current) {
  //     if (interviewStatus) {
  //       const submitRes = await submitInterview({ duration: elapsedTime })
  //       if (submitRes.success) {
  //         const getAzureStorageLink = await generateSignedAzureLinkService()
  //         if (getAzureStorageLink.success) {
  //           const { url, name } = getAzureStorageLink.data
  //           const file = new File([videoRecordBlob.current], name, {
  //             type: videoRecordBlob.current.type
  //           })
  //           const response: any = await uploadRecord(url, file)

  //           setTimeout(() => {
  //             navigate('/thankyou')
  //           }, 2000)
  //         }
  //       } else {
  //         toast.error('Something went wrong')
  //       }
  //     } else {
  //       if (isFinal) {
  //         const updateInterview = await updateStatus()
  //         updateInterviewStatus()
  //         if (updateInterview.success) {
  //           const getAzureStorageLink = await generateSignedAzureLinkService()
  //           if (getAzureStorageLink.success) {
  //             const { url, name } = getAzureStorageLink.data
  //             const file = new File([videoRecordBlob.current], name, {
  //               type: videoRecordBlob.current.type
  //             })
  //             const response: any = await uploadRecord(url, file)

  //             setTimeout(() => {
  //               navigate('/thankyou')
  //             }, 2000)
  //           }
  //         } else {
  //           toast.error('Something went wrong')
  //         }
  //       } else {
  //         const getAzureStorageLink = await generateSignedAzureLinkService()
  //         if (getAzureStorageLink.success) {
  //           const { url, name } = getAzureStorageLink.data
  //           const file = new File([videoRecordBlob.current], name, {
  //             type: videoRecordBlob.current.type
  //           })
  //           const response: any = await uploadRecord(url, file)
  //         }
  //       }
  //     }
  //   }
  // }

  // const uploadRecord = async (url: string, file: File) => {
  //   try {
  //     const blobServiceClient = new BlobServiceClient(url)

  //     const containerName = 'recordings'
  //     const containerClient =
  //       blobServiceClient.getContainerClient(containerName)

  //     const blobName = file.name
  //     const blockBlobClient = containerClient.getBlockBlobClient(blobName)

  //     const options = {
  //       blobHTTPHeaders: {
  //         blobContentType: file.type
  //       }
  //     }

  //     const uploadResponse = await blockBlobClient.uploadData(file, {
  //       blobHTTPHeaders: options.blobHTTPHeaders
  //     })
  //     setRecordedBlob(null)
  //     return uploadResponse
  //   } catch (error) {
  //     console.error(error)
  //     throw error
  //   }
  // }

  return (
    <main className='h-screen w-screen'>
      {!showThanku ? (
        <>
          <div className='flex justify-between py-2 px-4 border border-b'>
            <div className='flex gap-6 items-center'>
              <div className='flex items-center gap-2'>
                <img src={think} alt='think logo' width={50} />{' '}
                <span className='text-[#757575] text-xs'>
                  Powered by AnnAI®️
                </span>
              </div>
              <div className=' border-l px-5'>
                <span className='font-semibold text-xs'>
                  {`${positionName} Position Interview`}
                </span>
              </div>
            </div>
            <div className='flex gap-3 items-center'>
              <div className='bg-[#F5F5F5] rounded-full flex gap-3 p-1 items-center'>
                <BsFillRecordFill
                  className='bg-white rounded-full p-1'
                  color='#EB5757'
                />
                <span className='text-xs'>{formatTime(elapsedTime)}</span>
              </div>
              <IoMdHelpCircleOutline size={20} />

              <Button
                className='bg-[#C00F0C] text-white py-2 px-2 text-[10px] h-7'
                onClick={() => {
                  setExitModel(true)
                }}
              >
                <RxExit /> Exit Interview
              </Button>
            </div>
          </div>
          {interviewStatus === ISessionStatus.InterviewPaused ? (
            <div className='flex flex-col justify-center items-center p-6'>
              <div>
                Screen sharing has been stopped. To continue the session please
                click
                {' resume interview '}
                button.
              </div>
              <Button
                onClick={() => {
                  setInterviewStatus(ISessionStatus.InterviewResumed)
                }}
              >
                {'Resume Interview'}
              </Button>
            </div>
          ) : (
            <div className='space-y-5 p-6 relative'>
              <div className='grid grid-cols-5 lg:grid-cols-3 2xl:grid-cols-3 gap-6  h-[calc(100vh-130px)] '>
                <div className='col-span-4 lg:col-span-2 2xl:col-span-2 relative '>
                  {videoRef && (
                    <Webcam
                      audio={true}
                      muted={true}
                      ref={videoRef}
                      className='rounded-md w-full object-cover  h-[calc(100vh-130px)] '
                      videoConstraints={videoConstraints}
                    />
                  )}
                  <div className='absolute top-4 right-4 flex flex-col justify-center items-center w-[120px] h-[123px] bg-[rgba(0,0,0,0.3)] border rounded-lg border-solid border-white '>
                    <Avatar className='border-2 border-white w-14 h-14  '>
                      <AvatarImage src={aiImage2} />
                    </Avatar>
                    <div className=' text-white flex gap-2 items-center mt-2'>
                      <BiBarChart color='white' />
                      <span className='text-xs'>Ann</span>
                    </div>
                  </div>
                  <div className='bg-[rgba(0,0,0,0.3)] backdrop-blur-[8.166666984558105px] rounded-full absolute bottom-3 left-3 p-2'>
                    <div className='text-white flex gap-2 items-center '>
                      <BiBarChart color='white' />
                      <span className='capitalize text-xs '>{userName}</span>
                    </div>
                  </div>
                  <div className='absolute bottom-[-15px] left-1/2 transform -translate-x-1/2 '>
                    <Button
                      onClick={() => {
                        stopAudioRecording()
                        setSubLoader(true)
                      }}
                      className={`bg-[linear-gradient(90.11deg,#111111_-2.78%,#333333_99.29%)] border p-3 rounded-lg border-solid border-[#2C2C2C] flex items-end ${
                        speach ? '' : 'invisible'
                      } `}
                    >
                      {subLoader ? (
                        <span className='flex gap-3'>
                          <LoadingSpinner /> Please wait
                        </span>
                      ) : (
                        <>
                          <TbSpace size={40} /> Submit & Next
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className='bg-white shadow-[2px_4px_20px_rgba(0,0,0,0.08)] rounded-lg border-t-2 border-t-[#DFDFDF] border-solid'>
                  <div
                    className='w-full text-center p-2 rounded-t-md sticky'
                    style={{
                      background: `linear-gradient(  66.87deg,rgba(35, 176, 86, 0.1) -1.68%, rgba(20, 167, 239, 0.1) 28.73%, rgba(160, 43, 255, 0.1) 60.96%, rgba(239, 151, 20, 0.1) 89.1% )`
                    }}
                  >
                    Live Transcript
                  </div>
                  <ScrollArea className='h-[calc(100vh-182px)]  '>
                    <div className='flex flex-col h-full '>
                      {msgs.length > 0 &&
                        msgs.map((msg, index) => (
                          <>
                            <div
                              className='flex gap-3  p-2 pr-4 items-start text-xs '
                              key={index}
                              ref={index === msgs.length - 1 ? scrollRef : null}
                            >
                              <div className='rounded-full text-center flex items-center justify-center min-w-12 min-h-12'>
                                {/* <span className="capitalize">{msg.type == 0 ?' Ann ' : getUserInitials(userName) }</span> */}
                                <Avatar>
                                  {msg.type === 0 ? (
                                    <AvatarImage src={aiImage} />
                                  ) : (
                                    <AvatarFallback className='bg-[#EAC48F] text-white'>
                                      {getUserInitials(userName)}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                              </div>
                              <div className='flex-grow flex-col '>
                                <div className='flex gap-2 '>
                                  <span
                                    className=''
                                    style={
                                      {
                                        background: `${
                                          msg.type === 0
                                            ? 'linear-gradient(89.23deg, #23b056 1.26%, #14a7ef 34.95%, #a02bff 70.64%, #ef9714 101.81%)'
                                            : ''
                                        }`,
                                        WebkitBackgroundClip: `${
                                          msg.type === 0 ? 'text' : ''
                                        }`,
                                        color: `${
                                          msg.type === 0
                                            ? 'transparent'
                                            : '#757575'
                                        }`
                                      } as React.CSSProperties
                                    }
                                  >
                                    {msg.name}
                                  </span>
                                  <span className='text-[#757575]'>-</span>
                                  <span className='text-xs text-[#757575]'>
                                    {msg.time}
                                  </span>
                                </div>
                                <span> {msg.msg}</span>
                              </div>
                            </div>
                          </>
                        ))}
                      {speach && <div className=' m-3 loader'></div>}
                    </div>
                  </ScrollArea>
                  {proLoader && (
                    <ProgressBar
                      mode='indeterminate'
                      style={{ height: '6px' }}
                    ></ProgressBar>
                  )}
                </div>

                <audio
                  ref={audioRef}
                  key={audioUrl}
                  autoPlay
                  controls
                  onEnded={() => {
                    if (!showThanku) {
                      startAudioRecording()
                    }
                  }}
                  className='absolute top-6 z-[-1] invisible'
                >
                  <source src={audioUrl} type='audio/wav' />
                  Your browser does not support the audio element.
                </audio>
              </div>

              <div className=''>
                <Slider
                  value={[progress]}
                  max={100}
                  step={1}
                  className='icon-container '
                  disabled
                />
              </div>
            </div>
          )}
          <div>
            {exitModel && (
              <Dialog open={exitModel} onOpenChange={setExitModel}>
                <DialogContent className='bg-white border-none p-0 [&>button:last-child]:text-black [&>button:last-child]:text-[18px]'>
                  <DialogHeader className=' px-4'>
                    <DialogTitle className='text-xl font-[500] text-black py-3'>
                      Confirm
                    </DialogTitle>
                  </DialogHeader>
                  <div className='py-2 px-5 border-b-[1px] border'>
                    <span className='text-xs '>
                      Are you sure you want to exit the interview?
                    </span>

                    <DialogFooter className='!justify-end pt-6 pb-4'>
                      <Button
                        onClick={() => {
                          setExitModel(false)
                        }}
                        className='px-7 mr-4 py-2 font-[600] text-[14px] focus-visible:ring-0 focus-visible:ring-offset-0 rounded-md border border-[#000]'
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          setLoader(true)
                          setInterviewStatus(ISessionStatus.InterviewIncomplete)
                          setTimeout(() => {
                            setExitModel(false)
                            setShowThanku(true)
                            setLoading('loading')
                            // uploadFile(false ,true);
                          }, 3000)
                        }}
                        className='px-7 mr-4 py-2 font-[600] text-[14px] focus-visible:ring-0 focus-visible:ring-offset-0 rounded-md border border-[#000]'
                      >
                        {loader ? (
                          <span className='flex gap-3'>
                            <LoadingSpinner /> Please wait
                          </span>
                        ) : (
                          'Confirm'
                        )}
                      </Button>
                    </DialogFooter>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </>
      ) : (
        <Thankyou />
      )}
    </main>
  )
}
