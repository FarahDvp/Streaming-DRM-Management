import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MemberService } from '../../../service/member.service';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { TopbarComponent } from '../../shared/topbar/topbar.component';
import { CommonModule } from '@angular/common';
import { Member } from '../../../model/member';

@Component({
  selector: 'app-update-user',
  standalone: true,
  imports: [SidebarComponent, TopbarComponent, RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './update-user.component.html',
  styleUrl: './update-user.component.css'
})
export class UpdateUserComponent {

  public userForm: FormGroup;
  user: any;
  usersList: any[] = [];

  constructor(builder: FormBuilder, private router: Router, private route: ActivatedRoute, private userService: MemberService) {
    let userControls = {
      uid: new FormControl("", [Validators.required]),
      username: new FormControl("", [Validators.required]),
      fullname: new FormControl("", [
        Validators.required]),
      email: new FormControl("", [
        Validators.required,
        Validators.email]),
      password: new FormControl("", [Validators.required]),
      phone: new FormControl("", [Validators.required]),
      creationDate: new FormControl("", [Validators.required]),
      role: new FormControl("", [Validators.required])
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


  updateUser() {
    let data = this.userForm.value;
    let user = new Member(data.id, data.uid, data.username, data.fullname, data.email, data.phone, data.password, data.creationDate, data.blocked, data.role)

    this.userService.updateMember(user, user.uid).subscribe(
      res => {

        this.router.navigate(['/users-list']);
      },
      error => {
        alert(JSON.stringify(error));
      }
    )
  }
}
