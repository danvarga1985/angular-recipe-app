export class User {

  constructor(public  email: string,
              public id: string,
              /*
               A. Access to _token & _tokenExpirationDate has to be linked with validation logic - in getter.
               B. '_' means that the variable or function is meant to be private.
              */
              private _token: string,
              private _tokenExpirationDate: Date) {

  }

  // Getter - used for properties where additional logic has to precede the access.
  get token(): string {
    /*
     A. In case _tokenExpirationDate doesn't exist or if it is in the past (expired).
     B. 'new Date' is not an empty object, it holds the value of the time of its creation.
    */
    if (!this._tokenExpirationDate || new Date() > this._tokenExpirationDate) {
      return null;
    }

    return this._token;
  }
}
