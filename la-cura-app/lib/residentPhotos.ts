import type {
  SupabaseClient,
} from "@supabase/supabase-js";


export const RESIDENT_PHOTO_BUCKET =
  "resident-photos";

const SIGNED_URL_SECONDS =
  60 * 60 * 6;


function cleanText(
  value: unknown
) {
  return typeof value === "string"
    ? value.trim()
    : "";
}


/*
 * Supports:
 *
 * New La-Cura records:
 *   residents/abc.webp
 *
 * Older records:
 *   https://.../storage/v1/object/public/resident-photos/residents/abc.jpg
 *
 * It also tolerates previously generated signed/authenticated URLs.
 */
export function getResidentPhotoStoragePath(
  value:
    | string
    | null
    | undefined
): string | null {
  const photoValue =
    cleanText(value);

  if (!photoValue) {
    return null;
  }


  if (
    !/^https?:\/\//i.test(
      photoValue
    )
  ) {
    let path =
      photoValue.replace(
        /^\/+/,
        ""
      );

    const bucketPrefix =
      `${RESIDENT_PHOTO_BUCKET}/`;

    if (
      path.startsWith(
        bucketPrefix
      )
    ) {
      path =
        path.slice(
          bucketPrefix.length
        );
    }

    return path || null;
  }


  try {
    const url =
      new URL(photoValue);

    const markers = [
      `/storage/v1/object/public/${RESIDENT_PHOTO_BUCKET}/`,
      `/storage/v1/object/sign/${RESIDENT_PHOTO_BUCKET}/`,
      `/storage/v1/object/authenticated/${RESIDENT_PHOTO_BUCKET}/`,
    ];

    for (
      const marker
      of markers
    ) {
      const index =
        url.pathname.indexOf(
          marker
        );

      if (index >= 0) {
        const path =
          url.pathname.slice(
            index +
              marker.length
          );

        return path
          ? decodeURIComponent(
              path
            )
          : null;
      }
    }
  } catch {
    return null;
  }


  return null;
}


export async function getResidentPhotoSignedUrl(
  supabase:
    SupabaseClient,
  value:
    | string
    | null
    | undefined
): Promise<string | null> {
  const storagePath =
    getResidentPhotoStoragePath(
      value
    );

  if (!storagePath) {
    return null;
  }


  const {
    data,
    error,
  } = await supabase.storage
    .from(
      RESIDENT_PHOTO_BUCKET
    )
    .createSignedUrl(
      storagePath,
      SIGNED_URL_SECONDS
    );


  if (
    error ||
    !data?.signedUrl
  ) {
    console.error(
      "Unable to create resident photo signed URL:",
      error?.message ??
        "Unknown storage error"
    );

    return null;
  }


  return data.signedUrl;
}
