import React from 'react';
import YouTube from 'react-youtube';


const VideoPlayer = ({ vidId, height }) =>  {
    const videoId = vidId;
    const videoHeight = height;

    return (
        <div>
          <YouTube height={videoHeight}/>
        </div>
      );
    }
    
export default VideoPlayer;