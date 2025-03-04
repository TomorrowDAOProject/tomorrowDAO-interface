/**
 * @file circle
 * @author atom-yang
 */
import React from 'react';
import PropTypes from 'prop-types';
import {
  CircularProgressbar,
  CircularProgressbarWithChildren,
  buildStyles,
} from 'react-circular-progressbar';
import { If, Then, Else } from 'react-if';
import 'react-circular-progressbar/dist/styles.css';
import constants from '@redux/common/constants';

const {
  proposalActions,
} = constants;

const circleTypes = [
  ...Object.values(proposalActions),
  'Total',
];

const OUTER_STYLE_MAP = {
  [proposalActions.APPROVE]: buildStyles({
    pathColor: '#5D49F6',
    trailColor: '#404040',
    textColor: '#989DA0',
  }),
  [proposalActions.REJECT]: buildStyles({
    pathColor: '#FF485D',
    trailColor: '#404040',
    textColor: '#989DA0',
  }),
  [proposalActions.ABSTAIN]: buildStyles({
    pathColor: '#989DA0',
    trailColor: '#404040',
  }),
  Total: buildStyles({
    pathColor: '#6E81FF',
    trailColor: '#404040',
    textColor: '#989DA0',
  }),
};

const INNER_STYLE_MAP = {
  [proposalActions.APPROVE]: buildStyles({
    pathColor: '#5D49F6',
    trailColor: 'transparent',
    textColor: '#989DA0',
  }),
  [proposalActions.REJECT]: buildStyles({
    pathColor: '#FF485D',
    trailColor: 'transparent',
    textColor: '#989DA0',
  }),
  [proposalActions.ABSTAIN]: buildStyles({
    pathColor: '#989DA0',
    trailColor: 'transparent',
    textColor: '#989DA0',
  }),
  Total: buildStyles({
    pathColor: '#6E81FF',
    trailColor: 'transparent',
    textColor: '#989DA0',
  }),
};

const NORMAL_STYLE_MAP = {
  [proposalActions.APPROVE]: buildStyles({
    pathColor: '#5D49F6',
    trailColor: '#404040',
    textColor: '#989DA0',
  }),
  [proposalActions.REJECT]: buildStyles({
    pathColor: '#FF485D',
    trailColor: '#404040',
    textColor: '#989DA0',
  }),
  [proposalActions.ABSTAIN]: buildStyles({
    pathColor: '#989DA0',
    trailColor: '#404040',
    textColor: '#989DA0',
  }),
  Total: buildStyles({
    pathColor: '#6E81FF',
    trailColor: '#404040',
    textColor: '#989DA0',
  }),
};

const Circle = (props) => {
  const {
    isInProgress,
    value,
    threshold,
    type,
    maxValue,
    text,
    ...rest
  } = props;
  return (
    <If condition={isInProgress}>
      <Then>
        <CircularProgressbarWithChildren
          styles={OUTER_STYLE_MAP[type]}
          minValue={0}
          value={threshold}
          maxValue={maxValue}
          {...rest}
        >
          <CircularProgressbar
            value={value}
            minValue={0}
            text={text}
            styles={INNER_STYLE_MAP[type]}
            maxValue={maxValue}
          />
        </CircularProgressbarWithChildren>
      </Then>
      <Else>
        <CircularProgressbar
          value={value}
          minValue={0}
          text={text}
          styles={NORMAL_STYLE_MAP[type]}
          maxValue={maxValue}
          {...rest}
        />
      </Else>
    </If>
  );
};

Circle.propTypes = {
  // true to show two progress, false to show only one progress
  isInProgress: PropTypes.bool,
  value: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]).isRequired,
  threshold: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
  maxValue: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
  type: PropTypes.oneOf(circleTypes).isRequired,
};

Circle.defaultProps = {
  isInProgress: false,
  threshold: 0,
  maxValue: 100,
};
export default Circle;
