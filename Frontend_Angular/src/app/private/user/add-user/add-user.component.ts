import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MemberService } from '../../../service/member.service';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { TopbarComponent } from '../../shared/topbar/topbar.component';
import { CommonModule } from '@angular/common';
import { Member } from '../../../model/member';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [SidebarComponent, TopbarComponent, RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.css'
})
export class AddUserComponent {

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
  }


  addUser() {
    let data = this.userForm.value;
    let user = new Member(data.id, data.uid, data.username, data.fullname, data.email, data.phone, data.password, data.creationDate, data.blocked, data.role)

    this.userService.saveMember(user).subscribe(
      res => {
        console.log('Utilisateur ajouté avec succès', res);
        this.router.navigate(['/users-list']);
      },
      error => {
        alert(JSON.stringify(error));
      }
    )

  }
}
