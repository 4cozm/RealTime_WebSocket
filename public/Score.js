import { sendEvent } from './Socket.js';

class Score {
  score = 0;
  HIGH_SCORE_KEY = 'highScore';
  stageChange = true;
  currentStageIndex = 0; //초기 스테이지 값
  currentScorePersecond = 0;
  stageInfo;
  itemTable;

  constructor(ctx, scaleRatio, itemController) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.scaleRatio = scaleRatio;
    this.fetchStageInfo();
    this.fetchItemInfo();
    this.itemController = itemController; //아이템 컨트롤러의 인스턴스 받아옴
  }
  async fetchItemInfo() {
    try {
      const response = await fetch('/item');
      this.itemTable = await response.json();
    } catch (err) {}
  }
  async fetchStageInfo() {
    try {
      const response = await fetch('/stage');
      this.stageInfo = await response.json();
      this.currentScorePersecond = this.stageInfo.data[0].scorePerSecond;
    } catch (err) {
      console.error('스테이지 데이터 가져오기 실패');
    }
  }

  update(deltaTime) {
    this.score += deltaTime * 0.001 * this.currentScorePersecond;

    const nextStageScore =
      this.stageInfo.data[this.currentStageIndex].score + 100; //1단계->2단계 기준
    //1. 현재 스테이지의 최대 점수를 넘었는지 확인
    if (this.score >= nextStageScore && this.stageChange) {
      this.stageChange = false;
      //2. 다음 스테이지의 존재여부 확인
      if (this.currentStageIndex < this.stageInfo.data.length - 1) {
        //3. 스테이지 이동
        this.currentStageIndex++;
        //4. 스테이지별 알맞는 점수 배율을 적용
        this.currentScorePersecond =
          this.stageInfo.data[this.currentStageIndex].scorePerSecond;
        this.itemController.updateStage(
          this.stageInfo.data[this.currentStageIndex + 1].id
        );
        //5. 서버에 이벤트 전송
        sendEvent(11, {
          currentStage: this.stageInfo.data[this.currentStageIndex - 1].id,
          targetStage: this.stageInfo.data[this.currentStageIndex].id,
          score: this.score,
        });
        this.stageChange = true;
      }
    }
  }

  getItem(itemId) {
    const earnItem = this.itemTable.data.find((index) => index.id == itemId);
    this.score += earnItem.score;
    sendEvent(21, { id: itemId, score: earnItem.score });
  }

  reset() {
    this.score = 0;
  }

  setHighScore() {
    const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
    if (this.score > highScore) {
      localStorage.setItem(this.HIGH_SCORE_KEY, Math.floor(this.score));
      sendEvent(4, { score: Math.floor(this.score)}); //신기록 달성시, 점수정보를 전달
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
