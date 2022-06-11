import { Component, OnInit, Output } from '@angular/core';
import { Photo } from 'src/app/_models/photo';
import { AdminService } from 'src/app/_services/admin.service';

@Component({
  selector: 'app-photo-management',
  templateUrl: './photo-management.component.html',
  styleUrls: ['./photo-management.component.css']
})
export class PhotoManagementComponent implements OnInit {
  unapprovedPhotos: Photo[];

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.getPhotosForApproval();
  }

  getPhotosForApproval(){
    this.adminService.getPhotosForApproval().subscribe((photos) => {
      this.unapprovedPhotos = photos;
    })
  }

  onPhotoStatusChange(){
    this.getPhotosForApproval();
  }
}
