
<p align="center">

<a href="LICENSE">
<img src="https://img.shields.io/badge/License-MIT%202.0-blue.svg">
</a>

<a href="#">
<img src="https://img.shields.io/npm/v/ep_wrtc_heading">
</a>

<a href="#">
<img src="https://img.shields.io/npm/dt/ep_wrtc_heading">
</a>

</p>

<p align="center">
<a href="https://nodei.co/npm/ep_wrtc_heading/">
<img src="https://nodei.co/npm/ep_wrtc_heading.png">
</a>
</p>

# ep_wrtc_heading
Video Headings Plugin for Etherpad.

WebRTC video/audio, a dedicated chat room for each headlines (h tags).  

> Note: for better expriance use [ep_heading2](https://github.com/ether/ep_headings2), [ep_profile_modal](https://github.com/samirsayyad/ep_profile_modal)

## Installing

```bash
$ npm install ep_wrtc_heading
```

## Settings
To set a custom stun server, set ep_wrtc_heading.iceServer in your settings.json:
```json
"ep_wrtc_heading" : {
    "iceServers":[
        {"url": "stun:stun.l.google.com:19302"}
    ]
}
```

To ensure reliable connectivity we recommend setting both a STUN and TURN server. We don't set this by default and below are just example servers, you should ensure you use reliable STUN and TURN servers.
```json
"ep_wrtc_heading" : {
  "iceServers":[
    {
      "urls": [ "stun:216.246.6.224:3478", "stun:74.125.140.127:19302", "stun:[2a00:1450:400c:c08::7f]:19302" ]
    }
      ,
    {
      "urls": [ "turn:numb.viagenie.ca" ],
      "credential": "muazkh",
      "username": "webrtc@live.com"
    },
    {
      "urls": ["turn:192.158.29.39:3478?transport=udp"],
      "credential": "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
      "username": "28224511:1379330808"
    }

    ],
}
```

To set a custom small and/or large size in pixels, for the video displays, set one or both of the following in your settings.json:
```json
"ep_wrtc_heading": {
  "video": {
    "sizes": {
      "small": 200,
      "large": 400
    }
  }
}
```

To set Limitation for video-chat room:
```json
"ep_wrtc_heading": {
  "videoChatLimit": 4 // default
}
```

## Metrics
You can see metrics for various errors that users have when attempting to connect their camera/microphone:

* `ep_webrtc_err_Hardware`: Some sort of hardware-related connection problem on the users' computer.
* `ep_webrtc_err_NotFound`: Could not find user's camera/microphone.
* `ep_webrtc_err_Abort`: Some sort of other, non-hardware related connection problem on the user's computer.
* `ep_webrtc_err_NotSupported`: User's environment does not support webrtc.
* `ep_webrtc_err_Permission`: User did not grant permission to their camera/microphone
* `ep_webrtc_err_SecureConnection`: Etherpad is not set up on a secure connection, which is requried for webrtc
* `ep_webrtc_err_Unknown`: Some other unspecified error. Perhaps a bug in this plugin.


## Development

we use gulp to build minify and developong plugin

```bash
yarn start # run gulp watch for development
yarn build # build files for development
yarn build:prod # build sorce for profuction
```

## changelog


### [v0.30.0]:
  - bring up Gulp, to organize development workflow
  - create gulp tasks for development and production flow
  - priorityies js file loading, to prevent varibale assign missing
  - minify and concate js files
  - remove socket dependency on etherpad socket chanel (now on we can boot up webrtc socket in diffrent server)
  - optimize 'findTags' function performance
  - user leave now happend imidiatly, video interface remove imidiatly
  - update webrtc adaptor [80fbefb](https://github.com/webrtcHacks/adapter/tree/80fbefb4355046d899d7f78cfd41cd09942677d1)
  - chose vidoe codec
  - remove streaming when close room
  - make sure call strategy happend for the user are in header id
  - 



## License
This project is licensed under the [MIT License](./LICENSE).

> Inspire and use [ep_webrtc](https://github.com/ether/ep_webrtc)

If you have any further questions, please don’t hesitate to contact us.
<marzban98@gmail.com>