import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { RegisterComponent } from './authentication/register/register.component';
import { LoginComponent } from './authentication/login/login.component';
import { ProfileComponent } from './private/profile/profile.component';
import { ShakaPlayerComponent } from './private/shared/shaka-player/shaka-player.component';
import { ConfigVideosComponent } from './private/video/config-videos/config-videos.component';
import { ConfigContentPlayerComponent } from './private/config-content-player/config-content-player.component';
import { StreamComponent } from './private/stream/stream.component';
import { UsersListComponent } from './private/user/users-list/users-list.component';
import { StreamDetailsComponent } from './private/stream-details/stream-details.component';
import { UserDetailsComponent } from './private/user/user-details/user-details.component';
import { VideoDetailsComponent } from './private/video/video-details/video-details.component';
import { AddUserComponent } from './private/user/add-user/add-user.component';
import { UpdateUserComponent } from './private/user/update-user/update-user.component';
import { BlockedUserComponent } from './blocked-user/blocked-user.component';
import { TrackingViewsComponent } from './private/tracking/tracking-views/tracking-views.component';
import { TrackingDownloadsComponent } from './private/tracking/tracking-downloads/tracking-downloads.component';
import { StreamDownloadsComponent } from './private/stream-downloads/stream-downloads.component';
import { StreamHistoryComponent } from './private/stream-history/stream-history.component';
import { Register2Component } from './authentication/register2/register2.component';
import { Register3Component } from './authentication/register3/register3.component';
import { DashboardComponent } from './private/dashboard/dashboard.component';

export const routes: Routes = [
    { path: 'landing-page', component: LandingPageComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'register2', component: Register2Component },
    { path: 'register3', component: Register3Component },
    { path: 'login', component: LoginComponent },
    { path: 'blocked-user', component: BlockedUserComponent },
    { path: 'profile', component: ProfileComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'shaka-player', component: ShakaPlayerComponent },
    { path: 'config-videos', component: ConfigVideosComponent },
    { path: 'config-videos/:id', component: VideoDetailsComponent },
    { path: 'config-content-player', component: ConfigContentPlayerComponent },
    { path: 'stream', component: StreamComponent },
    { path: 'stream/:id', component: StreamDetailsComponent },
    { path: 'users-list', component: UsersListComponent },
    { path: 'users/add', component: AddUserComponent },
    { path: 'users/update/:id', component: UpdateUserComponent },
    { path: 'user-details/:id', component: UserDetailsComponent },
    { path: 'tracking-views', component: TrackingViewsComponent },
    { path: 'tracking-downloads', component: TrackingDownloadsComponent },
    { path: 'downloads', component: StreamDownloadsComponent },
    { path: 'history', component: StreamHistoryComponent }
];