import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Photo } from 'src/app/_models/photo';
import { AdminService } from 'src/app/_services/admin.service';
import { MembersService } from 'src/app/_services/members.service';

@Component({
  selector: 'app-photo-approval-card',
  templateUrl: './photo-approval-card.component.html',
  styleUrls: ['./photo-approval-card.component.css']
})
export class PhotoApprovalCardComponent implements OnInit {
  @Input() photo: Photo;
  @Output() photoStatusChanged = new EventEmitter<void>();

  
  constructor(private adminService: AdminService, private membersService: MembersService) { }

  ngOnInit(): void {
  }
  
  approvePhoto(){
   this.adminService.approvePhoto(this.photo.id).subscribe(() => {
     this.photoStatusChanged.emit()
    }); 
     
  }

  rejectPhoto(){
    this.adminService.rejectPhoto(this.photo.id).subscribe(error => console.log(error)); 
   }
}
