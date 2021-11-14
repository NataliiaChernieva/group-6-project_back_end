const queryString = require('query-string')
const axios = require('axios')
const { User } = require('../../models')
const { sendSuccessResponse } = require('../../helpers')

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, FRONTEND_URL, BASE_URL } = process.env

const googleRedirect = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`
  console.log('fullUrl', fullUrl)
  const urlObj = new URL(fullUrl)
  console.log('urlObj', urlObj)
  const urlParams = queryString.parse(urlObj.search)// search " "
  const code = urlParams.code
  console.log('code >>', code)

  const tokenData = await axios({
    url: 'https://oauth2.googleapis.com/token',
    method: 'post',
    data: {
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: `${BASE_URL}/api/auth/google-redirect`,
      grant_type: 'authorization_code',
      code,
    },
  })

  const userData = await axios({
    url: 'https://www.googleapis.com/oauth2/v2/userinfo',
    method: 'get',
    headers: {
      Authorization: `Bearer ${tokenData.data.access_token}`,
    },
  })
  console.log('userData >>', userData)

  let user = await User.findOne({ email: userData.data.email })
  if (!user) {
    user = new User({
      email: userData.data.email,
      token: tokenData.data.access_token,
      verifyToken: null,
      verify: true,
    })
    await user.save()
    sendSuccessResponse(res, user, 200)
  }
  await user.update({ token: tokenData.data.access_token })
  sendSuccessResponse(res, user, 200)

  return res.redirect(
    `${FRONTEND_URL}/google-redirect?email=${user.email}&token=${user.token}`
  )
}

module.exports = googleRedirect
//   return res.redirect(
//     `${FRONTEND_URL}/google-redirect?token=${newUser.token}&refreshToken=${efreshToken}&sessionId=${sessionId}`
//   )
