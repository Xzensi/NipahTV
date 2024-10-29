import { REST } from '@core/Common/utils'
import { SevenTV } from '.'

export function getUserCosmeticDataByConnection(
	platformId: SevenTV.Platform,
	userId: UserId
): Promise<{
	userByConnection: Pick<SevenTV.User, 'id' | 'display_name' | 'style' | 'avatar_url' | 'cosmetics' | 'username'>
}> {
	return REST.post('https://7tv.io/v3/gql', {
		query: `query GetUsersByConnection($platform: ConnectionPlatform!, $user_id: String!) {
                    userByConnection(platform: $platform, id: $user_id) {
                        id
                        display_name
                        style {
                            badge_id
                            color
                            paint_id
                            paint {
                                angle
                                color
                                function
                                gradients {
                                    angle
                                    at
                                    canvas_repeat
                                    canvas_size
                                    function
                                    image_url
                                    repeat
                                    shape
                                    stops {
                                        center_at
                                        at
                                        color
                                    }
                                }
                                id
                                image_url
                                kind
                                name
                                repeat
                                shadows {
                                    y_offset
                                    x_offset
                                    radius
                                    color
                                }
                                shape
                                text {
                                    weight
                                    variant
                                    transform
                                    stroke {
                                        width
                                        color
                                    }
                                    shadows {
                                        color
                                        radius
                                        x_offset
                                        y_offset
                                    }
                                }
                                stops {
                                    color
                                    at
                                    center_at
                                }
                            }
                            badge {
                                id
                                kind
                                name
                                tag
                                tooltip
                                host {
                                    url
                                    files {
                                        size
                                        height
                                        width
                                        format
                                    }
                                }
                            }
                        }
                        avatar_url
                        cosmetics {
                            id
                            kind
                            selected
                        }
                        username
                    }
                }`,
		variables: {
			platform: platformId,
			user_id: userId
		}
	}).then(res => res.data)
}

export function getUserEmoteSetConnectionsDataByConnection(
	platformId: SevenTV.Platform,
	userId: UserId
): Promise<Pick<SevenTV.User, 'id' | 'emote_sets' | 'connections'>> {
	return REST.post('https://7tv.io/v3/gql', {
		query: `query GetUsersByConnection($platform: ConnectionPlatform!, $user_id: String!) {
                    userByConnection(platform: $platform, id: $user_id) {
                        id
                        emote_sets(entitled: true) {
                            flags
                            id
                            name
                            tags
                            owner_id
                        }
                        connections {
                            platform
                            emote_set_id
                        }
                    }
                }`,
		variables: {
			platform: platformId,
			user_id: userId
		}
	}).then(res => res.data?.userByConnection)
}

export function getUsersByConnection(
	platformId: SevenTV.Platform,
	userId1: UserId,
	userId2: UserId
): Promise<{
	data: {
		user_with_cosmetics: Pick<
			SevenTV.User,
			'id' | 'display_name' | 'style' | 'avatar_url' | 'cosmetics' | 'username'
		>
		user_emote_sets_connections: Pick<SevenTV.User, 'id' | 'emote_sets' | 'connections'>
	}
}> {
	return REST.post('https://7tv.io/v3/gql', {
		query: `query GetUsersByConnection($platform: ConnectionPlatform!, $user_id: String!, $user_id2: String!) {
                    user_cosmetics: userByConnection(platform: $platform, id: $user_id) {
                        id
                        display_name
                        style {
                            badge_id
                            color
                            paint_id
                            paint {
                                angle
                                color
                                function
                                gradients {
                                    angle
                                    at
                                    canvas_repeat
                                    canvas_size
                                    function
                                    image_url
                                    repeat
                                    shape
                                    stops {
                                        center_at
                                        at
                                        color
                                    }
                                }
                                id
                                image_url
                                kind
                                name
                                repeat
                                shadows {
                                    y_offset
                                    x_offset
                                    radius
                                    color
                                }
                                shape
                                text {
                                    weight
                                    variant
                                    transform
                                    stroke {
                                        width
                                        color
                                    }
                                    shadows {
                                        color
                                        radius
                                        x_offset
                                        y_offset
                                    }
                                }
                                stops {
                                    color
                                    at
                                    center_at
                                }
                            }
                            badge {
                                id
                                kind
                                name
                                tag
                                tooltip
                                host {
                                    url
                                    files {
                                        size
                                        height
                                        width
                                        format
                                    }
                                }
                            }
                        }
                        avatar_url
                        cosmetics {
                            id
                            kind
                            selected
                        }
                        username
                    }
        
                    user_emote_sets_connections: userByConnection(platform: $platform, id: $user_id2) {
                        id
                        emote_sets(entitled: true) {
                            flags
                            id
                            name
                            tags
                            owner_id
                        }
                        connections {
                            platform
                            emote_set_id
                        }
                    }
                }`,
		variables: {
			platform: platformId,
			user_id: userId1,
			user_id2: userId2
		}
	})
}
