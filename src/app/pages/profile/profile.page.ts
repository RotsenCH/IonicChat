import { Component, OnInit } from '@angular/core';
// profile.page.ts
import { AuthService } from '../../services/auth.service';
import { ChatService } from '../../services/chat.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  user: any;
  editProfile: boolean = false;

  constructor(public auth: AuthService,private chatService: ChatService, private router: Router) { }

  ngOnInit() {
    this.auth.user$.subscribe(user => this.user = user);
  }

  async uploadImage(event: any) {
    const uploadedImageUrl = await this.auth.uploadImage(event, this.user.uid);
    if (uploadedImageUrl) {
      this.user.photoURL = uploadedImageUrl; // Update user's photoURL
    }
  }  
  
  signOut() {
    this.chatService.signOut().then(() => {
      this.router.navigateByUrl('/', { replaceUrl: true });
    });
  }

  updateUsername(username: string) {
    this.auth.updateUsername(username, this.user.uid);
  }
}