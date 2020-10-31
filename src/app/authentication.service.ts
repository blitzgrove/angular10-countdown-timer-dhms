import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { timer, Observable, Subject, BehaviorSubject } from "rxjs";
import {
  tap,
  startWith,
  switchMap,
  takeUntil,
  take,
  map
} from "rxjs/operators";

export const LOGIN_TIME = 901;

@Injectable()
export class AuthenticationService {
  public loginStatusSrc = new BehaviorSubject<boolean>(false);
  public stopTimerSrc = new Subject<any>();
  public loginStatus$ = this.loginStatusSrc.asObservable();
  public stopTimer$ = this.stopTimerSrc.asObservable();

  constructor(private http: HttpClient) {}

  login(): Observable<any> {
    // simulate a login HTTP call
    return this.http.get("https://jsonplaceholder.typicode.com/users/1").pipe(
      tap({
        next: () => this.loginStatusSrc.next(true),
        error: () => this.loginStatusSrc.next(false)
      })
    );
  }

  logout() {
    // simulate a logout HTTP call
    return this.http.get("https://jsonplaceholder.typicode.com/users/1").pipe(
      tap({
        next: () => {
          this.loginStatusSrc.next(false); // <-- hide timer
          this.stopTimerSrc.next(); // <-- stop timer running in background
        },
        error: () => this.loginStatusSrc.next(false)
      })
    );
  }

  countdownTimer() {
    return <T>(source: Observable<T>) => {
      return source.pipe(
        startWith(null),
        switchMap(_ => {
          let counter = LOGIN_TIME;
          return timer(0, 1000).pipe(
            take(counter),
            map(_ => this.secondsToDhms(--counter)),
            tap({
              next: null,
              error: null,
              complete: () => {
                this.stopTimerSrc.next(); // <-- stop timer in background
                this.loginStatusSrc.next(false);
                console.log("Countdown complete. Rerouting to login page...");
                // redirect to login page
              }
            })
          );
        }),
        takeUntil(this.stopTimer$)
      );
    };
  }

  secondsToDhms(totalSeconds) {
    let padZero = value => String(value).padStart(2, "0");

    totalSeconds = Number(totalSeconds);
    const dTemp = totalSeconds / 3600;
    const hTemp = dTemp % 24;
    const mTemp = (hTemp * 3600) % 3600;

    const d = Math.floor(dTemp / 24);
    const h = Math.floor(hTemp);
    const m = Math.floor(mTemp / 60);
    const s = Math.floor(mTemp % 60);

    const dDisplay = d > 0 ? padZero(d) + (d == 1 ? " Day, " : " Days, ") : "";
    const hDisplay = h > 0 ? padZero(h) + ":" : "";
    const mDisplay = padZero(m) + ":";
    const sDisplay = padZero(s);
    return `${dDisplay}${hDisplay}${mDisplay}${sDisplay}`;
  }
}
