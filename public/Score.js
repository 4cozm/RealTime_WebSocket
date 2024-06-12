import { sendEvent } from './Socket.js';

class Score {
  score = 0;
  HIGH_SCORE_KEY = 'highScore';
  stageChange = true;
  currentStageIndex = 0; //초기 스테이지 값
  currentScorePersecond = 0;
  stageInfo;

  constructor(ctx, scaleRatio) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.scaleRatio = scaleRatio;
    this.fetchStageInfo();
  }
  async fetchStageInfo() {
    try {
      const response = await fetch('/stage');
      this.stageInfo = await response.json();
      this.currentScorePersecond = this.stageInfo.data[0].scorePerSecond;
      console.log('스테이지 데이터 가져오기 성공');
    } catch (e) {
      console.error('스테이지 데이터 가져오기 실패', e);
    }
  }

  update(deltaTime) {
    this.score += deltaTime * 0.001 * this.currentScorePersecond;

    const nextStageScore =
      this.stageInfo.data[this.currentStageIndex].score + 100; //1단계->2단계 기준
    //1. 현재 스테이지의 최대 점수를 넘었는지 확인
    if (this.score >= nextStageScore && this.stageChange) {
      console.log('스테이지 변경 시작!');
      this.stageChange = false;
      //2. 다음 스테이지의 존재여부 확인
      if (this.currentStageIndex < this.stageInfo.data.length - 1) {
        //3. 스테이지 이동
        this.currentStageIndex++;
        //4. 스테이지별 알맞는 점수 배율을 적용
        this.currentScorePersecond =
          this.stageInfo.data[this.currentStageIndex].scorePerSecond;
        console.log(
          '스테이지 이동함, 현재 초당 점수 배율 = ' + this.currentScorePersecond
        );
        //5. 서버에 이벤트 전송
        sendEvent(11, {
          currentStage: this.stageInfo.data[this.currentStageIndex - 1].id,
          targetStage: this.stageInfo.data[this.currentStageIndex].id,
        });
        this.stageChange = true;
      }
    }
  }

  getItem(itemId) {
    // 아이템 획득시 점수 변화
    this.score += 100;
  }

  reset() {
    this.score = 0;
  }

  setHighScore() {
    const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
    if (this.score > highScore) {
      localStorage.setItem(this.HIGH_SCORE_KEY, Math.floor(this.score));
    }
  }

  getScore() {
    return this.score;
  }

  draw() {
    const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
    const y = 20 * this.scaleRatio;

    const fontSize = 20 * this.scaleRatio;
    this.ctx.font = `${fontSize}px serif`;
    this.ctx.fillStyle = '#525250';

    const scoreX = this.canvas.width - 75 * this.scaleRatio;
    const highScoreX = scoreX - 125 * this.scaleRatio;

    const scorePadded = Math.floor(this.score).toString().padStart(6, 0);
    const highScorePadded = highScore.toString().padStart(6, 0);

    this.ctx.fillText(scorePadded, scoreX, y);
    this.ctx.fillText(`HI ${highScorePadded}`, highScoreX, y);
  }
}

export default Score;
