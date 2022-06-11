import { AdminService } from 'src/app/_services/admin.service';
import { MembersService } from 'src/app/_services/members.service';
import { Member } from './../../_models/member';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { environment } from 'src/environments/environment';
import { AccountService } from 'src/app/_services/account.service';
import { User } from 'src/app/_models/user';
import { take } from 'rxjs/operators';
import { ConfirmService } from 'src/app/_services/confirm.service';

@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css']
})
export class PhotoEditorComponent implements OnInit {
  @Input() member: Member;
  uploader: FileUploader;
  hasBaseDropzoneOver = false;
  baseUrl = environment.apiUrl;
  user: User;
  tooltip: string = "This photo is waiting admin\'s approval";

  constructor(private accountService: AccountService, private memberService: MembersService,
   private confirmService: ConfirmService) { 
   this.accountService.currentUser$.pipe(take(1)).subscribe(user => this.user = user); 
  }

  ngOnInit(): void {
    this.intializeUploader();
  }

  fileOverBase(e: any){
    this.hasBaseDropzoneOver = e;
  }
  
  setMainPhoto(photo){
  this.memberService.setMainPhoto(photo.id).subscribe(() => {
    this.user.photoUrl = photo.url;
    this.accountService.setCurrentUser(this.user);
    this.member.photoUrl = photo.url;
    this.member.photos.forEach(p => {
      if(p.isMain) p.isMain = false;
      if(p.id === photo.id) p.isMain = true;
    })
  })
  }

  deletePhoto(photoId: number){
  this.confirmService.confirm('Delete Photo','Are you sure you want to delete this photo?','Yes','No')
  .subscribe(result => {
      if(result){
       this.memberService.deletePhoto(photoId).subscribe(() => {
         this.member.photos = this.member.photos.filter(x => x.id !== photoId);
         });
      }
    }) 
  }

  intializeUploader() {
   this.uploader = new FileUploader({
     url: this.baseUrl + "users/add-photo",
     authToken: 'Bearer ' + this.user.token,
     isHTML5: true,
     allowedFileType: ['image'],
     removeAfterUpload: true,
     autoUpload: false,
     maxFileSize: 10* 1024 * 1024
   });
   this.uploader.onAfterAddingFile = (file) => {
     file.withCredentials = false;
   }

   this.uploader.onSuccessItem = (item, response, status, headers) => {
     if(response) {
       const photo = JSON.parse(response);
       this.member.photos.push(photo);
       if(photo.isMain){
         this.user.photoUrl =  photo.url;
         this.member.photoUrl = photo.url;
         this.accountService.setCurrentUser(this.user);
       }
     }
   }
  }
}
