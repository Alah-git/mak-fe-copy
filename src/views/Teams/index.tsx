import React from 'react'
import { AutoRenewIcon, Flex, Heading } from 'maki-uikit'
import orderBy from 'lodash/orderBy'
import { useTeams } from 'state/hooks'
import Page from 'components/layout/Page'
import TeamListCard from './components/TeamListCard'
import TeamHeader from './components/TeamHeader'

const Teams = () => {
  const { teams, isLoading } = useTeams()
  const teamList = Object.values(teams)
  const topTeams = orderBy(teamList, ['points', 'id', 'name'], ['desc', 'asc', 'asc'])

  return (
    <Page>
      <TeamHeader />
      <Flex alignItems="center" justifyContent="space-between" mb="32px">
        <Heading size="xl">Teams</Heading>
        {isLoading && <AutoRenewIcon spin />}
      </Flex>
      {topTeams.map((team, index) => (
        <TeamListCard key={team.id} rank={index + 1} team={team} />
      ))}
    </Page>
  )
}

export default Teams
