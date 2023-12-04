// auth.service.ts
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable, of } from 'rxjs';
import { switchMap, first } from 'rxjs/operators';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<any>;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private storage: AngularFireStorage
  ) {
    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.afs.doc<any>(`users/${user.uid}`).valueChanges();
        } else {
          return of(null);
        }
      })
    );
  }

  async uploadImage(event: any, userId: string): Promise<string | null> {
    const file = event.target.files[0];
    const filePath = `users/${userId}/profile.jpg`;
    const task = this.storage.upload(filePath, file);
    const snapshot = await task.snapshotChanges().pipe(first()).toPromise();
    const url = await snapshot?.ref.getDownloadURL();
    await this.afs.doc(`users/${userId}`).update({ photoURL: url });
    return url || null; // Return the URL
  }
  

  async updateUsername(username: string, userId: string): Promise<void> {
    this.afs.doc(`users/${userId}`).update({ username: username });
  }
}