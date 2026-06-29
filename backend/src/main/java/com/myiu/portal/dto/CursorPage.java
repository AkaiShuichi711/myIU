package com.myiu.portal.dto;

import java.util.Base64;
import java.util.List;

/**
 * Cursor-based pagination result.
 *
 * WHY cursor-based instead of LIMIT/OFFSET:
 * OFFSET N on a 1-million-row table forces PostgreSQL to scan N rows just to skip them.
 * That's O(N) work that grows linearly with page number.
 *
 * Cursor pagination uses WHERE id < :cursor ORDER BY id — O(log N) with a B-tree index.
 * Facebook's Graph API, Twitter API, GitHub API, Stripe API all use cursor pagination.
 *
 * The cursor is opaque to the client (base64-encoded) so internal structure can change.
 * Clients just pass nextCursor back on the next request — they don't interpret it.
 *
 * @param <T> the item type
 */
public record CursorPage<T>(
        List<T> items,
        String nextCursor,   // null if no more pages
        boolean hasMore,
        int count
) {
    /** Encode a UUID/string cursor to opaque base64 token. */
    public static String encodeCursor(String value) {
        return Base64.getUrlEncoder().withoutPadding()
                .encodeToString(value.getBytes());
    }

    /** Decode cursor token back to internal value. */
    public static String decodeCursor(String cursor) {
        return new String(Base64.getUrlDecoder().decode(cursor));
    }

    public static <T> CursorPage<T> of(List<T> items, String lastCursor, int pageSize) {
        boolean hasMore = items.size() == pageSize;
        String nextCursor = hasMore ? lastCursor : null;
        return new CursorPage<>(items, nextCursor, hasMore, items.size());
    }
}
