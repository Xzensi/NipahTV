import { REST } from '@core/Common/utils'
import { SevenTV } from '.'

export function getUserByConnection(
	platformId: SevenTV.Platform,
	userId: UserId
): Promise<{
	data: {
		userByConnection: SevenTV.User
	}
}> {
	return REST.post('https://7tv.io/v3/gql', {
		query: `query GetUserByConnection($platform: ConnectionPlatform!, $id: String!) {
                    userByConnection(platform: $platform, id: $id) {
                        display_name
                        id
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
                        }
                        avatar_url
                        cosmetics {
                            id
                            kind
                            selected
                        }
                    }
                }`,
		variables: {
			platform: platformId,
			id: userId
		}
	})
}
