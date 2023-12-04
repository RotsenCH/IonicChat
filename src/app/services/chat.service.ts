import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { switchMap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import firebase from 'firebase/compat/app'; // Cambio en la importación aquí
import 'firebase/compat/firestore'; // Agregar esta línea para importar Firestore

export interface User {
  uid?: string;
  email?: string;
}

export interface Message {
  createdAt: firebase.firestore.Timestamp;
  id: string;
  from: string;
  msg: string;
  fromName: string;
  myMsg: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  currentUser: User | null = null;
  
  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore) {
    this.afAuth.onAuthStateChanged((user) => {
      if (user) {
        this.currentUser = {
          uid: user.uid,
          email: user.email || '' // Aquí asignamos un valor por defecto si el email es null o undefined
        };
      } else {
        this.currentUser = null;
      }
    });
  }

  async signup({ email, password }: { email: string; password: string }): Promise<any> {
    const credential = await this.afAuth.createUserWithEmailAndPassword(email, password);

    const uid = credential.user?.uid;

    return this.afs.doc(
      `users/${uid}`
    ).set({
      uid,
      email: credential.user?.email,
    });
  }

  signIn({ email, password }: { email: string; password: string }) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  signOut(): Promise<void> {
    return this.afAuth.signOut();
  }

  addChatMessage(msg:string) {
    return this.afs.collection('messages').add({
      msg: msg,
      from: this.currentUser?.uid || '', // Verificamos si currentUser es nulo o undefined
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  }

  getChatMessages() {
    let users: User[] = [];
    return this.getUsers().pipe(
      switchMap(res => {
        users = res;
        return this.afs.collection('messages', ref => ref.orderBy('createdAt')).valueChanges({ idField: 'id' }) as Observable<Message[]>;
      }),
      map(messages => {
        for (let m of messages) {
          m.fromName = this.getUserForMsg(m.from, users);
          m.myMsg = this.currentUser?.uid === m.from;
        }
        return messages;
      })
    );
  }

  private getUsers(): Observable<User[]> {
    return this.afs.collection('users').valueChanges({ idField: 'uid' }) as Observable<User[]>;
  }

  private getUserForMsg(msgFromId: string, users: User[]): string {
    for (let usr of users) {
      if (usr.uid == msgFromId) {
        return usr.email || '';
      }
    }
    return 'Deleted';
  }
  // TODO Chat functionality
}
