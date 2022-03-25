import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from './_models/user';
import { AccountService } from './_services/account.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'Dating app!';
  users: any;
  user: User;
  constructor(private accountService: AccountService){}
  
  ngOnInit() {
  this.setCurrentUser();
  }
  IsThereLoggedInUser():boolean{
    this.user = JSON.parse(localStorage.getItem('user'));
    if(this.user) return true;
    return false;
  }
  setCurrentUser(){
   if(this.IsThereLoggedInUser())
  this.accountService.setCurrentUser(this.user);
  }

 
}
