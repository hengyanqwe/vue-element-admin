//设置权限对应的角色
//admin是账号，token是角色
const tokens = {
  admin: {
    token: 'admin-token'
  },
  editor: {
    token: 'editor-token'
  },
  ad: {
    token: 'editor-token'
  }
  ,
  1: {
    token: '1'
  }
}
//设置角色对应的账号
//admin-token 是角色，admin是账号
var users = {
  'admin-token': {
    roles: ['admin'],
    introduction: 'I am a super administrator',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Super Admin'
  },
  'editor-token': {
    roles: ['editor'],
    introduction: 'I am an editor',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Normal Editor'
  },
  '1': {
    roles: ['2'],
    introduction: 'I am an editor',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Normal Editor'
  }
}

module.exports = [

  // 这tm才是user login
  {
    url: '/vue-element-admin/user/login',
    type: 'post',
    response: config => {
      console.log("config")
      console.log(config.body)
      const { username } = config.body
      const {password} = config.body
      /*return {
        code: 60204,
        message: config
      }*/
      console.log(username)
      console.log(password)
      //const token = tokens["admin"]
      //console.log(JSON.stringify(token))
      const token = tokens[1]
      console.log("token")
      console.log(token)
      users['1'].roles = username.split(",")
      console.log(users)
      // mock error
      if (password == "error") {
        return {
          code: 60204,
          message: '账号或密码错误！'
        }
      }

      return {
        code: 20000,
        data: token
      }
    }
  },

  // get user info
  {
    url: '/vue-element-admin/user/info\.*',
    type: 'get',
    response: config => {
      const { token } = config.query
      const info = users[token]
      console.log(info)
      // mock error
      if (!info) {
        return {
          code: 50008,
          message: 'Login failed, unable to get user details.'
        }
      }

      return {
        code: 20000,
        data: info
      }
    }
  },

  // user logout
  {
    url: '/vue-element-admin/user/logout',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  }
]
