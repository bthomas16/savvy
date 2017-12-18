import { Component, OnInit, ViewChild, trigger, state, transition, style, animate } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-teacher-profile',
  templateUrl: './teacher-profile.component.html',
  styleUrls: ['./teacher-profile.component.css'],
  animations: [
    trigger('modalStatusFade', [
      state('none', style({visibility: 'hidden', opacity: 0})),
      state('fadeOut', style({visibility: 'hidden',transition: 'all .5s ease-in-out',
      opacity: 0
      })),
      state('fadeIn', style({visibility: 'visible', transition: 'all .5s ease-in-out',
      opacity: 1
      })),
      transition('fadeOut <=> *', animate(350)),
    ])
  ]
})
export class TeacherProfileComponent implements OnInit {
  @ViewChild("fileInput") fileInput;

  modalState = 'none';


  email;
  message;
  vidSubmitMessage
  messageClass;
  userID;
  fullname;
  isStudent: boolean = false;;
  isTeacher: boolean = true;
  skill1;
  skill2;
  profPic;
  processing: boolean = false;
  show: boolean = false;
  edit: boolean = false;
  currentUrl;
  teacherID;
  isEdit: boolean = false;
  isEditExp: boolean = false;
  videoFileName;
  profVideo;
  isBioEdit: boolean = false;
  maxExperiences: boolean = false;
  experienceValue;
  experiences;
  canSubmitVideo: boolean = false;
  showVidSubmitMessage: boolean = false;
  canChangeStatus: boolean = false;
  onlineStatus: boolean = false;
  isOnlineString: String = 'Offline';

  profPicName;
  bioValue;
  bio;

  // isLoading: boolean = true;

  originalArray;


  awsBucket = 'https://s3.amazonaws.com/savvyappphotos/';


  constructor(public authService: AuthService, private router: Router, private activatedRoute: ActivatedRoute, private cookieService: CookieService) {
  }

  getBioValue(value) {
      this.bioValue = value;
  }

  bioValueSubmit() {
    const bio = {
      bio: this.bioValue
    }
    this.authService.onBioFormSubmit(bio).subscribe(data => {
      if(!data.success) {
        this.messageClass = 'alert alert-danger';
        this.message = data.message;
      } else {
        this.show = true;
        this.isEdit = false;
        this.messageClass = 'alert alert-success';
        this.message = data.message;
        this.getBio();
        setTimeout(() => {
          this.show = false
        }, 1200);
      }
    });
  }
  getVidFile(event) {
    this.videoFileName = event.target.files[0];
    this.videoFileName = this.videoFileName.name;
    if(this.videoFileName) {
      this.canSubmitVideo = true;
    }
  }

  videoSubmit() {
    this.showVidSubmitMessage = true;
    let fi = this.fileInput.nativeElement;
    if (fi.files && fi.files[0]) {
        let fileToUpload = fi.files[0];
        this.authService.uploadVideo(fileToUpload).subscribe(data => {
          if (!data.success) {
            this.messageClass = 'alert alert-danger';
            this.vidSubmitMessage = data.message;
            setTimeout(() => {
              this.showVidSubmitMessage = false;
            }, 1800);
          } else {
            this.messageClass = 'alert alert-success';
            this.canSubmitVideo = false;
            this.vidSubmitMessage = data.message;
            setTimeout(() => {
              this.showVidSubmitMessage = false;
              this.canSubmitVideo = false;
            }, 1800);
          }
        })
      }
    }

  becomeTeacherRegister() {
    this.isTeacher = true;
    this.processing = true;
    const user = { isTeacher: this.isTeacher}
    this.authService.updateTeacher(user).subscribe(data => {
      if (!data.success) {
        this.messageClass = 'alert alert-danger';
        this.message = data.message;
        this.processing = false;
      } else {
        this.messageClass = 'alert alert-success'
        this.message = data.message
        setTimeout(() => {
          this.show = false;
        }, 1400)
      }
    })
  }

  isUserTheTeacher() {
    if(this.teacherID == this.userID) {
      return false
    } else {
      return true;
    }
  }

  getNewExperience(event){
    this.experienceValue = event.target.value;
  }

  addExperience() {
    this.experiences.push(this.experienceValue);
    if(this.experiences.length >= 5) {
      this.maxExperiences = true;
    }
    // this.experienceSubmit();
    this.experienceValue = '';
  }

  experienceSubmit() {
    this.isEditExp = !this.isEditExp;
    this.authService.onExperienceSubmit(this.experiences).subscribe(data => {
      if (!data.success) {
        this.messageClass = 'alert alert-danger';
        this.message = data.message;
      } else {
        this.messageClass = 'alert alert-success';
        this.message = data.message;
      }
    })
  }
  deleteExperience() {
    const trying = this.originalArray;
    this.experiences.pop()
  }

  resetExperience() {
    this.experiences = [];
    this.maxExperiences = false;
  }

  cancelExp() {
    this.isEditExp = !this.isEditExp;
    this.authService.getProfile()
    .subscribe(profile => {
      this.experiences = profile.user.experiences
    });
  }

  goOffline() {
    this.isOnlineString = 'Offline';
    this.onlineStatus = false;
    let status = {
      status: this.onlineStatus
    }
    this.authService.onlineStatus(status).subscribe(data => {
      if(!data.success) {
        this.messageClass = 'alert alert-danger';
        this.message = data.message;
      }
      this.messageClass = 'alert alert-danger';
      this.message = data.message;
      setTimeout(() => {
        this.closeStatusModal()
      }, 800);
    });
  }

  goOnline() {
    this.isOnlineString = 'Online';
    this.onlineStatus = true;
    let status = {
      status: this.onlineStatus
    }
    this.authService.onlineStatus(status).subscribe(data => {
      if(!data.success) {
        this.messageClass = 'alert alert-danger';
        this.message = data.message;
      }
      this.messageClass = 'alert alert-success';
      this.message = data.message;
      setTimeout(() => {
        this.closeStatusModal()
      }, 800);
    });
  }

  // checkCookies() {
  //     this.cookieValue = this.cookieService.get('Status');
  //     if(this.cookieValue == "Here, have some status based cookies!") {
  //       return true
  //     }
  //     setTimeout(() => {
  //       this.cookieService.set( 'Status', 'Here, have some status based cookies!' );
  //       return false
  //     },120000)
  // }
  //
  closeStatusModal() {
    this.modalState = 'fadeOut';
  }

  getBio() {
    this.authService.getProfile()
    .subscribe(profile => {
      this.bio = profile.user.bio;
    });
  }

  ngOnInit() {
    this.authService.getProfile()
    .subscribe(profile => {
      this.userID = profile.user.id;
      this.fullname = profile.user.fullname;
      this.email = profile.user.email;
      this.profPicName = profile.user.profPic;
      if(this.profPicName == undefined) {
        this.profPicName = 'blankProf.png'
      }
      this.profPic = this.awsBucket + this.profPicName;
      this.isTeacher = profile.user.isTeacher;
      this.isStudent = profile.user.isStudent;
      this.skill1 = profile.user.skill1;
      this.skill2 = profile.user.skill2;
      this.experiences = profile.user.experiences;
      this.originalArray = this.experiences;
      this.onlineStatus = profile.user.onlineStatus;
      console.log('hit me', '1')
      if(this.onlineStatus) {
        console.log('hit me', '2')
        this.isOnlineString = 'Online';
      }

      if(this.experiences.length == 5) {
        this.maxExperiences = true;
      }
      this.profVideo = profile.user.profVideo;
      this.bio = profile.user.bio;
      if((this.profPicName !== 'blankProf.png') && (this.skill1 && this.skill2 !== '') && (this.bio !== '') && this.experiences.length !== 0 || null) {
        this.canChangeStatus = true;
      }
      if(!this.onlineStatus) {
        console.log('hit me', '3')
        setTimeout(() => {
          this.modalState = 'fadeIn';
        }, 1200);
      }
    });
    window.scrollTo(0, 0);
  }
}
