import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../_models/user';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  model: any = {}

  constructor(private accountService: AccountService) { }

  ngOnInit(): void { }

  get currentUser$(): Observable<User> {
    return this.accountService.currentUser$;
  }

  login() {
    this.accountService.login(this.model).subscribe(
      response => {
        console.log(response);
      },
      error => {
        console.log(error.error);
      }
    )
  }

  logout() {
    this.accountService.logout();
  }
}
