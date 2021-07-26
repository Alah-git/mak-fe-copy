import { Currency, HUOBI, JSBI, TokenAmount } from 'maki-sdk'
import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { Button, ChevronDownIcon, AddIcon, CardBody, Text } from 'maki-uikit-v2'
import CardNav from 'components/CardNav'
import { LightCard } from 'components/Card'
import { AutoColumn, ColumnCenter } from 'components/Column'
import CurrencyLogo from 'components/CurrencyLogo'
import { FindPoolTabs } from 'components/NavigationTabs'
import { MinimalPositionCard } from 'components/PositionCard'
import CurrencySearchModal from 'components/SearchModal/CurrencySearchModal'
import { PairState, usePair } from 'data/Reserves'
import { useActiveWeb3React } from 'hooks'
import { usePairAdder } from 'state/user/hooks'
import { useTokenBalance } from 'state/wallet/hooks'
import { StyledInternalLink } from 'components/Shared'
import { currencyId } from 'utils/currencyId'
import AppBody from 'components/AppBody'
import { Dots } from '../Pool/styleds'

enum Fields {
  TOKEN0 = 0,
  TOKEN1 = 1
}

export default function PoolFinder() {
  const { account } = useActiveWeb3React()

  const [showSearch, setShowSearch] = useState<boolean>(false)
  const [activeField, setActiveField] = useState<number>(Fields.TOKEN1)

  const [currency0, setCurrency0] = useState<Currency | null>(HUOBI)
  const [currency1, setCurrency1] = useState<Currency | null>(null)

  const [pairState, pair] = usePair(currency0 ?? undefined, currency1 ?? undefined)
  const addPair = usePairAdder()
  useEffect(() => {
    if (pair) {
      addPair(pair)
    }
  }, [pair, addPair])

  const validPairNoLiquidity: boolean =
    pairState === PairState.NOT_EXISTS ||
    Boolean(
      pairState === PairState.EXISTS &&
        pair &&
        JSBI.equal(pair.reserve0.raw, JSBI.BigInt(0)) &&
        JSBI.equal(pair.reserve1.raw, JSBI.BigInt(0))
    )

  const position: TokenAmount | undefined = useTokenBalance(account ?? undefined, pair?.liquidityToken)
  const hasPosition = Boolean(position && JSBI.greaterThan(position.raw, JSBI.BigInt(0)))

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      if (activeField === Fields.TOKEN0) {
        setCurrency0(currency)
      } else {
        setCurrency1(currency)
      }
    },
    [activeField]
  )

  const handleSearchDismiss = useCallback(() => {
    setShowSearch(false)
  }, [setShowSearch])

  const prerequisiteMessage = (
    <LightCard padding="45px 10px">
      <Text style={{ textAlign: 'center' }}>
        {!account ? 'Connect to a wallet to find pools' : 'Select a token to find your liquidity.'}
      </Text>
    </LightCard>
  )

  const PageWrap = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: calc(100vh - 64px);
  `

  return (
    <PageWrap>
      <CardNav activeIndex={1} />
      <AppBody>
        <FindPoolTabs />
        <CardBody>
          <AutoColumn gap="md">
            <Button
              onClick={() => {
                setShowSearch(true)
                setActiveField(Fields.TOKEN0)
              }}
              startIcon={currency0 ? <CurrencyLogo currency={currency0} style={{ marginRight: '.5rem' }} /> : null}
              endIcon={<ChevronDownIcon width="24px" color="white" />}
              width="100%"
            >
              {currency0 ? currency0.symbol : 'Select Token'}
            </Button>

            <ColumnCenter>
              <AddIcon color="textSubtle" />
            </ColumnCenter>

            <Button
              onClick={() => {
                setShowSearch(true)
                setActiveField(Fields.TOKEN1)
              }}
              startIcon={currency1 ? <CurrencyLogo currency={currency1} style={{ marginRight: '.5rem' }} /> : null}
              endIcon={<ChevronDownIcon width="24px" color="white" />}
              width="100%"
            >
              {currency1 ? currency1.symbol : 'Select Token'}
            </Button>

            {hasPosition && (
              <ColumnCenter
                style={{ justifyItems: 'center', backgroundColor: '', padding: '12px 0px', borderRadius: '12px' }}
              >
                <Text style={{ textAlign: 'center' }}>Pool Found!</Text>
              </ColumnCenter>
            )}

            {currency0 && currency1 ? (
              pairState === PairState.EXISTS ? (
                hasPosition && pair ? (
                  <MinimalPositionCard pair={pair} />
                ) : (
                  <LightCard padding="45px 10px">
                    <AutoColumn gap="sm" justify="center">
                      <Text style={{ textAlign: 'center' }}>You don’t have liquidity in this pool yet.</Text>
                      <StyledInternalLink to={`/add/${currencyId(currency0)}/${currencyId(currency1)}`}>
                        <Button variant="primary" size="sm">
                              Add Liquidity
                          </Button>
                      </StyledInternalLink>
                    </AutoColumn>
                  </LightCard>
                )
              ) : validPairNoLiquidity ? (
                <LightCard padding="45px 10px">
                  <AutoColumn gap="sm" justify="center">
                    <Text style={{ textAlign: 'center' }}>No pool found.</Text>
                    <StyledInternalLink to={`/add/${currencyId(currency0)}/${currencyId(currency1)}`}>
                      Create pool.
                    </StyledInternalLink>
                  </AutoColumn>
                </LightCard>
              ) : pairState === PairState.INVALID ? (
                <LightCard padding="45px 10px">
                  <AutoColumn gap="sm" justify="center">
                    <Text style={{ textAlign: 'center' }}>
                      Invalid Pair
                    </Text>
                  </AutoColumn>
                </LightCard>
              ) : pairState === PairState.LOADING ? (
                <LightCard padding="45px 10px">
                  <AutoColumn gap="sm" justify="center">
                    <Text style={{ textAlign: 'center' }}>
                      Loading
                      <Dots />
                    </Text>
                  </AutoColumn>
                </LightCard>
              ) : null
            ) : (
              prerequisiteMessage
            )}
          </AutoColumn>

          <CurrencySearchModal
            isOpen={showSearch}
            onCurrencySelect={handleCurrencySelect}
            onDismiss={handleSearchDismiss}
            showCommonBases
            selectedCurrency={(activeField === Fields.TOKEN0 ? currency1 : currency0) ?? undefined}
          />
        </CardBody>
      </AppBody>
    </PageWrap>
  )
}
