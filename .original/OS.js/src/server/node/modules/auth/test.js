/*!
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *
 * Copyright (c) 2011-2017, Anders Evenrud <andersevenrud@gmail.com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 'AS IS' AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 */

const Authenticator = require('./../authenticator.js');
const User = require('./../../user.js');

const users = {
  1000: {
    id: 1000,
    username: 'normal',
    name: 'Normal User',
    groups: ['admin']
  },
  1001: {
    id: 1001,
    username: 'demo',
    name: 'Admin User',
    groups: ['admin']
  },
  1002: {
    id: 1002,
    username: 'restricted',
    name: 'Restricted User',
    groups: ['application']
  }
};

class TestAuthenticator extends Authenticator {
  login(data) {
    return new Promise((resolve, reject) => {
      const found = Object.keys(users)
        .map((k) => users[k])
        .find((u) => u.username === data.username);

      return found ? resolve(found) : reject('Invalid credentials');
    });
  }

  getUserFromRequest(http) {
    const uid = http.session.get('uid');
    return Promise.resolve(User.createFromObject(users[uid]));
  }

  getBlacklist(user) {
    return new Promise((resolve) => {
      if ( user.id === 1002 ) {
        resolve(['default/CoreWM']);
      } else {
        resolve([]);
      }
    });
  }

}

module.exports = new TestAuthenticator();
