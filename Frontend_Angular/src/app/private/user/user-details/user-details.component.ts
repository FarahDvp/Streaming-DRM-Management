import { Component } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { TopbarComponent } from '../../shared/topbar/topbar.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MemberService } from '../../../service/member.service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [SidebarComponent, TopbarComponent, RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.css'
})
export class UserDetailsComponent {
  public userForm: FormGroup;
  user: any;
  usersList: any[] = [];

  constructor(builder: FormBuilder, private router: Router, private route: ActivatedRoute, private userService: MemberService) {
    let userControls = {
      uid: new FormControl(""),
      username: new FormControl(""),
      fullname: new FormControl(""),
      email: new FormControl(""),
      password: new FormControl(""),
      phone: new FormControl(""),
      creationDate: new FormControl(""),
      role: new FormControl("")
    }
    this.userForm = builder.group(userControls)
  }

  get uid() { return this.userForm.get('uid') }
  get username() { return this.userForm.get('username') }
  get fullname() { return this.userForm.get('fullname') }
  get email() { return this.userForm.get('email') }
  get password() { return this.userForm.get('password') }
  get phone() { return this.userForm.get('phone') }
  get creationDate() { return this.userForm.get('creationDate') }
  get role() { return this.userForm.get('role') }

  ngOnInit(): void {
    this.userDetails();
  }

  userDetails() {
    let idUser = this.route.snapshot.params['id'];
    console.log(idUser);
    this.userService.getOneMember(idUser).subscribe(
      res => {
        this.user = res;
        this.userForm.patchValue({
          uid: this.user.uid,
          username: this.user.username,
          fullname: this.user.fullname,
          email: this.user.email,
          password: this.user.password,
          phone: this.user.phone,
          creationDate: this.user.creationDate,
          role: this.user.role
        });
      },
      err => {
        console.log(err);
      }

    )
  }



}
