class SoundManager {
  constructor() {
    this.directory = "sound/";

    // Sound effects
    this.scan = new Audio(this.directory + "scan.mp3");

    this.registration = new Audio(this.directory + "registration.mp3");

    this.startRun = new Audio(this.directory + "start_run.mp3");

    this.finishRun = new Audio(this.directory + "finish_run.mp3");

    this.finishRunNewBest = new Audio(
      this.directory + "finish_run_new_best.mp3",
    );
  }

  playScan() {
    this.scan.current = 0;
    this.scan.play();
  }

  playRegistration() {
    this.registration.current = 0;
    this.registration.play();
  }

  playStartRun() {
    this.startRun.current = 0;
    this.startRun.play();
  }

  playFinishRun() {
    this.finishRun.current = 0;
    this.finishRun.play();
  }

  playFinishBestRun() {
    this.finishRunNewBest.current = 0;
    this.finishRunNewBest.play();
  }
}
