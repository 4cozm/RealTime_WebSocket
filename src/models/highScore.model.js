//유저의 최고점수를 관리하는 파일
const highScore = {score:10}; //임시로 10 부여

export const setScore = (score)=>{
    if(!score){
        return 0; //안들어오면 아무 처리도 하지 않음
    }
    if(score>highScore.score){
        highScore.score = score;
    }
}

export const getScore = () =>{
    return highScore.score;
}
