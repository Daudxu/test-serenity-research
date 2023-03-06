import React, {useState, useEffect, useCallback} from 'react';
import {Typography} from '@mui/material';
import classes from './ssRewards.module.css';
import RewardsTable from './ssRewardsTable.js';
import {Add} from '@mui/icons-material';
import stores from '../../stores';
import {ACTIONS} from '../../stores/constants';
import {useAppThemeContext} from '../../ui/AppThemeProvider';
import TokenSelect from '../select-token/select-token'

export default function ssRewards() {

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  const [rewards, setRewards] = useState([]);
  const [vestNFTs, setVestNFTs] = useState([]);
  const [search, setSearch] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [token, setToken] = useState(null);
  const [veToken, setVeToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const {appTheme} = useAppThemeContext();

  const updateNftsAndRewards = (selectedToken) => {
    const nfts = stores.stableSwapStore.getStore('vestNFTs');
    if (!!nfts) {
      // console.log('stableSwapUpdated')
      // if(!vestNFTs) {
      setVestNFTs(nfts);
      // }
      // if(!veToken) {
      setVeToken(stores.stableSwapStore.getStore('veToken'));
      // }

      if (nfts?.length > 0) {
        nfts.sort((a, b) => (+b.lockValue) - (+a.lockValue));

        let nft = nfts[0];
        if(!selectedToken) {
          selectedToken = token;
        } else {
          setToken(selectedToken);
          nft = selectedToken;
        }


        if (selectedToken === null) {
          setToken(nft);
        }

        stores.dispatcher.dispatch({type: ACTIONS.GET_REWARD_BALANCES, content: {tokenID: nft.id}});
      } else {
        stores.dispatcher.dispatch({type: ACTIONS.GET_REWARD_BALANCES, content: {tokenID: 0}});
      }

      forceUpdate();
    }
  };

  const stableSwapUpdated = (rew) => {
    let nfts = stores.stableSwapStore.getStore('vestNFTs');
    if (!!nfts) {
      setVestNFTs(nfts);

      let tokenId = 0;
      if (nfts.length > 0) {
        nfts = nfts.sort((a, b) => (+a.lockValue) - (+b.lockValue));
        setVestNFTs(nfts);
        const nft = nfts[0];
        if (token === null) {
          setToken(nft);
        }
        tokenId = nft.id;
      }

      window.setTimeout(() => {
        stores.dispatcher.dispatch({type: ACTIONS.GET_REWARD_BALANCES, content: {tokenID: tokenId}});
      });

      forceUpdate();
    }
  };

  const rewardBalancesReturned = (rew) => {
    // console.log('rewardBalancesReturned', rew)
    if (!rew) {
      rew = stores.stableSwapStore.getStore('rewards');
    }
    setRewards(rew);
  };

  useEffect(() => {
    stores.emitter.on(ACTIONS.CONFIGURED_SS, updateNftsAndRewards);
    stores.emitter.on(ACTIONS.REWARD_BALANCES_RETURNED, rewardBalancesReturned);
    return () => {
      stores.emitter.removeListener(ACTIONS.CONFIGURED_SS, updateNftsAndRewards);
      stores.emitter.removeListener(ACTIONS.REWARD_BALANCES_RETURNED, rewardBalancesReturned);
    };
  }, [token]);

  useEffect(() => {

    updateNftsAndRewards();

    const claimReturned = () => {
      setLoading(false);
    };

    const claimAllReturned = () => {
      setLoading(false);
    };

    stores.emitter.on(ACTIONS.CLAIM_BRIBE_RETURNED, claimReturned);
    stores.emitter.on(ACTIONS.CLAIM_REWARD_RETURNED, claimReturned);
    stores.emitter.on(ACTIONS.CLAIM_PAIR_FEES_RETURNED, claimReturned);
    stores.emitter.on(ACTIONS.CLAIM_VE_DIST_RETURNED, claimReturned);
    stores.emitter.on(ACTIONS.CLAIM_ALL_REWARDS_RETURNED, claimAllReturned);
    return () => {
      stores.emitter.removeListener(ACTIONS.CLAIM_BRIBE_RETURNED, claimReturned);
      stores.emitter.removeListener(ACTIONS.CLAIM_REWARD_RETURNED, claimReturned);
      stores.emitter.removeListener(ACTIONS.CLAIM_PAIR_FEES_RETURNED, claimReturned);
      stores.emitter.removeListener(ACTIONS.CLAIM_VE_DIST_RETURNED, claimReturned);
      stores.emitter.removeListener(ACTIONS.CLAIM_ALL_REWARDS_RETURNED, claimAllReturned);
    };
  }, []);

  const onClaimAll = () => {
    setLoading(true);
    let sendTokenID = 0;
    if (token && token.id) {
      sendTokenID = token.id;
    }
    stores.dispatcher.dispatch({type: ACTIONS.CLAIM_ALL_REWARDS, content: {pairs: rewards, tokenID: sendTokenID}});
  };


  const handleChange = (event) => {
    setToken(event.target.value);
    stores.dispatcher.dispatch({type: ACTIONS.GET_REWARD_BALANCES, content: {tokenID: event.target.value.id}});
  };

  const open = Boolean(anchorEl);
  const id = open ? 'transitions-popper' : undefined;

  window.addEventListener('resize', () => {
    setWindowWidth(window.innerWidth);
  });

  return (
    <>
      <div
        className={[classes.toolbarContainer, 'g-flex', 'g-flex--align-baseline', 'g-flex--space-between'].join(' ')}>
        <div
          className={[classes.addButton, classes[`addButton--${appTheme}`], 'g-flex', 'g-flex--align-center', 'g-flex--justify-center'].join(' ')}
          onClick={onClaimAll}>
          <div
            className={[classes.addButtonIcon, 'g-flex', 'g-flex--align-center', 'g-flex--justify-center'].join(' ')}>
            <Add style={{width: 20, color: '#fff'}}/>
          </div>

          <Typography
            className={[classes.actionButtonText, classes[`actionButtonText--${appTheme}`], 'g-flex', 'g-flex--align-center', 'g-flex--justify-center'].join(' ')}>
            Claim All
          </Typography>
        </div>

        <div className={['g-flex', 'g-flex--align-baseline'].join(' ')}>
          <div
            className={classes.disclaimerContainer}
            style={{
              position: 'relative',
            }}>
            <div className={[classes.divider, classes[`divider--${appTheme}`]].join(' ')}>
            </div>

            {windowWidth > 1100 &&
              <Typography className={[classes.disclaimer, classes[`disclaimer--${appTheme}`]].join(' ')}>
                Rewards are an estimation that aren’t exact till the<br />supply → rewardPerToken calculations have run
              </Typography>
            }

            {windowWidth <= 1100 && windowWidth > 1005 &&
              <Typography className={[classes.disclaimer, classes[`disclaimer--${appTheme}`]].join(' ')}>
                Rewards are an estimation that aren’t<br />exact till the supply → rewardPerToken<br />calculations have
                run
              </Typography>
            }

            {windowWidth <= 1005 &&
              <Typography className={[classes.disclaimer, classes[`disclaimer--${appTheme}`]].join(' ')}>
                Rewards are an estimation that aren’t exact till the supply → rewardPerToken calculations have run
              </Typography>
            }
          </div>

          {/*todo after initialization, the selected ve shows as empty field, need figuring out*/}
          {TokenSelect({value: token, options: vestNFTs, symbol: veToken?.symbol, handleChange, placeholder: 'Choose veDYST'})}
        </div>
      </div>

      <RewardsTable rewards={rewards} tokenID={token?.id} />
    </>
  );
}
