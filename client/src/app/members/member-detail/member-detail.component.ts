import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions } from '@kolkov/ngx-gallery';
import { map } from 'rxjs/operators';
import { Member } from 'src/app/_models/member';
import { MembersService } from 'src/app/_services/members.service';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit {
  member: Member;
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];

  constructor(private membersService: MembersService, private route: ActivatedRoute) { }

  async ngOnInit(): Promise<void> {
    this.galleryOptions = [
      {
        width: '500px',
        height: '500px',
        imagePercent: 100,
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide,
        preview: false,
      },
    ];

    await this.loadMember();

    this.galleryImages = this.member.photos.map(photo => {
      return {
        small: photo.url,
        medium: photo.url,
        big: photo.url,
      };
    });
  }

  async loadMember() {
    return this.membersService.getMember(this.route.snapshot.paramMap.get('username'))
      .pipe(map(member => this.member = member))
      .toPromise();
  }

}
