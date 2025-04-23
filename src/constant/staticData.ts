export const Server = {
  Server: 0,
  User: 1,
  None: 2,
};

export const INTERVIEW_MAX_IDLE_COUNT = 4

export const progressConstants:any = {
  ice_breaker: 0.05,
  relevance: 0.15,
  technical: 0.35,
  competency: 0.75,
  logistical: 0.95,
};

export const ISessionStatus = {
  InterviewNotStarted : 1,
  InterviewInteruption : 2,
  InterviewStarted: 3,
  InterviewPaused: 4,
  InterviewResumed: 5,
  InterviewCompleted: 6,
  InterviewIncomplete: 7,
}

export const videoConstraints = {
  width: 800,
  height: 500,
  borderRadius: 10,
  facingMode: "user",
  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
};

export const VideoConstants = {
  FileName: "recorded-video.webm",
  FileType: "video/webm",
};