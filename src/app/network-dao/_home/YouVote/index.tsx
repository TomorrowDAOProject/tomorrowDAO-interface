import React from 'react';
import { AddFilled } from '@aelf-design/icons';
import { Button } from 'aelf-design';

const Frame = (): JSX.Element => {
  return (
    <div className="flex ">
      <div>
        <h2>Your vote makes difference</h2>
        <p>
          Vote with or delegate your ELF tokens to help protect theintegrity of the AELF protocol.
        </p>
        <Button>
          <AddFilled />
          How to Vote
        </Button>
      </div>
      <div></div>
    </div>
  );
};
export default Frame;
