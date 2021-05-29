import React from 'react'
import { Text } from 'makiswap-uikit'
import { getBalanceNumber } from 'utils/formatBalance'
import { useTotalRewards } from 'hooks/useTickets'
import useI18n from 'hooks/useI18n'
import { usePriceMakiHusd } from 'state/hooks'
import { BigNumber } from 'bignumber.js'
import CardHusdValue from './CardHusdValue'

const LotteryJackpot = () => {
  const TranslateString = useI18n()
  const lotteryPrizeAmount = useTotalRewards()
  const balance = getBalanceNumber(lotteryPrizeAmount)
  const lotteryPrizeAmoutCake = balance.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })
  const lotteryPrizeAmountBusd = new BigNumber(balance).multipliedBy(usePriceMakiHusd()).toNumber()

  return (
    <>
      <Text bold fontSize="24px" style={{ lineHeight: '1.5' }}>
        {lotteryPrizeAmoutCake} {TranslateString(999, 'MAKI')}
      </Text>
      <CardHusdValue value={lotteryPrizeAmountBusd} />
    </>
  )
}

export default LotteryJackpot
