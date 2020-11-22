import { keyframes } from '@angular/animations';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Member } from '../_models/member';
import { PaginatedResult } from '../_models/pagination';
import { User } from '../_models/user';
import { UserParams } from '../_models/userParams';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  baseUrl = environment.apiUrl;
  members: Member[] = [];
  memberCache = new Map();
  user: User;
  userParams: UserParams;

  constructor(private http: HttpClient, private accountService: AccountService) {
    this.accountService.currentUser$.pipe(take(1)).subscribe(
      user => {
        this.user = user;
        this.userParams = new UserParams(user);
      }
    );
  }

  getUserParams() {
    return this.userParams;
  }

  setUserParams(params: UserParams) {
    this.userParams = params;
  }

  resetUserParams() {
    this.userParams = new UserParams(this.user);
    return this.userParams;
  }

  getMembers(userParams: UserParams) {
    const cacheKey = Object.values(userParams).join('-');
    var response = this.memberCache.get(cacheKey);
    if (response) {
      return of(response);
    }

    let params = this.getParamsFromObject(userParams);

    return this.getPaginatedResult<Member[]>(this.baseUrl + 'users', params)
      .pipe(map(response => {
        this.memberCache.set(cacheKey, response);
        return response;
      }));
  }

  private getParamsFromObject(object: Object): HttpParams {
    let params = new HttpParams();

    for (const key in object) {
      params = params.append(key, object[key].toString());
    }

    return params;
  }

  getMember(username: string) {
    const member = [...this.memberCache.values()]
      .reduce((a, b) => [...a, ...b.result], [])
      .find((member: Member) => member.username === username);

    if (member) return of(member);

    return this.http.get<Member>(this.baseUrl + 'users/' + username);
  }

  updateMember(member: Member) {
    return this.http.put(this.baseUrl + 'users', member).pipe(
      map(() => {
        const index = this.members.indexOf(member);
        this.members[index] = member;
      })
    );
  }

  setMainPhoto(photoId: number) {
    return this.http.put(this.baseUrl + 'users/set-main-photo/' + photoId, {});
  }

  deletePhoto(photoId: number) {
    return this.http.delete(this.baseUrl + 'users/delete-photo/' + photoId);
  }

  addLike(username: string) {
    return this.http.post(this.baseUrl + 'likes/' + username, {});
  }

  getLikes(predicate: string, pageNumber, pageSize) {
    let params = this.getParamsFromObject({
      'pageNumber': pageNumber,
      'pageSize': pageSize,
      'predicate': predicate
    });
    return this.getPaginatedResult<Partial<Member[]>>(this.baseUrl + 'likes', params);
  }

  private getPaginatedResult<T>(url, params) {
    const paginatedResult = new PaginatedResult<T>();
    return this.http.get<T>(url, { observe: 'response', params }).pipe(
      map(response => {
        paginatedResult.result = response.body;
        if (response.headers.get('Pagination') !== null) {
          paginatedResult.pagination = JSON.parse(response.headers.get('Pagination'));
        }
        return paginatedResult;
      })
    );
  }
}
