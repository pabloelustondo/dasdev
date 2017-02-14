import { Component } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Http } from '@angular/http';
import { contentHeaders } from '../common/headers';

const styles   = require('./login.css');
const template = require('./login.html');

@Component({
  selector: 'login',
  template: template,
  styles: [ styles ]
})
export class Login {
  error;
  redirectUrl:string;
  url:string;
  code;string;
  domainid:string;
  adminflow:boolean = false;

  constructor(public router: Router,
              private activatedRoute: ActivatedRoute,
              public http: Http) {
  }

  ngOnInit() {
    // subscribe to router event
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.url = params['url'];
      this.code = params['code'];
      this.domainid = params['state'];

      if (this.code && this.domainid) {

        let code = this.code;
        let domainid = this.domainid;
        let body = JSON.stringify({domainid, code});
        this.http.post('http://localhost:3004/sessions/create', body, {headers: contentHeaders})
          .subscribe(
            response => {
              this.error = null;
              localStorage.setItem('id_token', response.json().id_token);
              if (this.url) {
                window.location.href = this.url + "/#/dad/login?id_token=" + response.json().id_token;
              }
              this.router.navigate(['home']);
            },
            error => {
              this.error = error.text();
              console.log(error.text());
            }
          );
      }
    });
  }

  changeMethod(v){
    console.log(v);

  }

  login(event, loginmethod, domainid, username, password) {

    if(event) event.preventDefault();

    if (loginmethod.value === 'mcuser' && !this.code) {

      //we need to get the url for the domain id entered, which by the way is a good way to verify the domain id

      this.http.get('http://localhost:3004/urlbydomainid?domainid=' + domainid.value)
        .subscribe(
          response => {
            let result = JSON.parse(response['_body']);
            window.location.href = result.url + "/oauth/authorize?response_type=code&client_id=6a106988b81c43499ea04e96943e05c1" + "&state=" + domainid.value;
          },
          error => {
            alert("the provided domain id could not be found");
            console.log(error.text());
          }
        );

    } else {
      let code = this.code;
      let body = JSON.stringify({domainid, username, password, code});
      this.http.post('http://localhost:3004/sessions/create', body, {headers: contentHeaders})
        .subscribe(
          response => {
            this.error = null;
            localStorage.setItem('id_token', response.json().id_token);
            if (this.url) {
              window.location.href = this.url + "/#/dad/login?id_token=" + response.json().id_token;
            }
            this.router.navigate(['home']);
          },
          error => {
            this.error = error.text();
            console.log(error.text());
          }
        );

    }
  }

  signup(event) {
    event.preventDefault();
    this.router.navigate(['signup']);
  }
}
