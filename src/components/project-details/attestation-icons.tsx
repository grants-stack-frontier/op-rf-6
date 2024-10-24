export function AttUserIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 22H4V20C4 17.2386 6.23858 15 9 15H15C17.7614 15 20 17.2386 20 20V22ZM12 13C8.68629 13 6 10.3137 6 7C6 3.68629 8.68629 1 12 1C15.3137 1 18 3.68629 18 7C18 10.3137 15.3137 13 12 13Z"
        fill="#3374DB"
      />
    </svg>
  );
}

export function AttUserStarIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 14V22H4C4 17.5817 7.58172 14 12 14ZM18 21.5L15.0611 23.0451L15.6224 19.7725L13.2447 17.4549L16.5305 16.9775L18 14L19.4695 16.9775L22.7553 17.4549L20.3776 19.7725L20.9389 23.0451L18 21.5ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13Z"
        fill="#3374DB"
      />
    </svg>
  );
}

export function AttThumbsUpIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 8.99997H5V21H2C1.44772 21 1 20.5523 1 20V9.99997C1 9.44769 1.44772 8.99997 2 8.99997ZM7.29289 7.70708L13.6934 1.30661C13.8693 1.13066 14.1479 1.11087 14.3469 1.26016L15.1995 1.8996C15.6842 2.26312 15.9026 2.88253 15.7531 3.46966L14.5998 7.99997H21C22.1046 7.99997 23 8.8954 23 9.99997V12.1043C23 12.3656 22.9488 12.6243 22.8494 12.8658L19.755 20.3807C19.6007 20.7554 19.2355 21 18.8303 21H8C7.44772 21 7 20.5523 7 20V8.41419C7 8.14897 7.10536 7.89462 7.29289 7.70708Z"
        fill="#3374DB"
      />
    </svg>
  );
}

export function AttStarIcon({ size = 24 }: { size?: 24 | 64 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {size === 24 && (
        <path
          d="M12.0006 18.26L4.94715 22.2082L6.52248 14.2799L0.587891 8.7918L8.61493 7.84006L12.0006 0.5L15.3862 7.84006L23.4132 8.7918L17.4787 14.2799L19.054 22.2082L12.0006 18.26Z"
          fill="#F3BE50"
        />
      )}
      {size === 64 && (
        <path
          d="M32.0013 48.6934L13.1921 59.2219L17.393 38.0798L1.56738 23.4448L22.9728 20.9069L32.0013 1.33337L41.0295 20.9069L62.4349 23.4448L46.6095 38.0798L50.8103 59.2219L32.0013 48.6934Z"
          fill="#F3BE50"
        />
      )}
    </svg>
  );
}

export function ThumbRatingIcon({ rating, size = 16 }: { rating: number, size?: 16 | 24 }) {
  function getColorFromRating(rating: number) {
    if (rating >= 8.34) return '#3374DB';
    if (rating >= 6.67) return '#69A0F7';
    if (rating >= 3.34) return '#BCBFCD';
    if (rating >= 1.67) return '#FF5C6C';
    return '#FF0420';
  }

  if (rating >= 5)
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {size === 16 && (
          <path
            d="M1.33366 5.99998H3.33366V14H1.33366C0.965472 14 0.666992 13.7015 0.666992 13.3333V6.66665C0.666992 6.29846 0.965472 5.99998 1.33366 5.99998ZM4.86225 5.13805L9.12926 0.871073C9.24652 0.753773 9.43226 0.74058 9.56493 0.840106L10.1333 1.2664C10.4565 1.50875 10.6021 1.92169 10.5024 2.31311L9.73353 5.33331H14.0003C14.7367 5.33331 15.3337 5.93027 15.3337 6.66665V8.06953C15.3337 8.24373 15.2995 8.4162 15.2333 8.5772L13.1703 13.5871C13.0675 13.8369 12.824 14 12.5539 14H5.33366C4.96547 14 4.66699 13.7015 4.66699 13.3333V5.60946C4.66699 5.43265 4.73723 5.26308 4.86225 5.13805Z"
            fill={getColorFromRating(rating)}
          />
        )}
        {size === 24 && (
          <path
            d="M2 8.99997H5V21H2C1.44772 21 1 20.5523 1 20V9.99997C1 9.44769 1.44772 8.99997 2 8.99997ZM7.29289 7.70708L13.6934 1.30661C13.8693 1.13066 14.1479 1.11087 14.3469 1.26016L15.1995 1.8996C15.6842 2.26312 15.9026 2.88253 15.7531 3.46966L14.5998 7.99997H21C22.1046 7.99997 23 8.8954 23 9.99997V12.1043C23 12.3656 22.9488 12.6243 22.8494 12.8658L19.755 20.3807C19.6007 20.7554 19.2355 21 18.8303 21H8C7.44772 21 7 20.5523 7 20V8.41419C7 8.14897 7.10536 7.89462 7.29289 7.70708Z"
            fill={getColorFromRating(rating)}
          />
        )}
      </svg>
    );

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {size === 16 && (
        <path
          d="M14.667 10H12.667V2H14.667C15.0352 2 15.3337 2.29848 15.3337 2.66667V9.33333C15.3337 9.70153 15.0352 10 14.667 10ZM11.1384 10.8619L6.87139 15.1289C6.75413 15.2462 6.56842 15.2594 6.43571 15.1599L5.86733 14.7336C5.54419 14.4913 5.39858 14.0783 5.49823 13.6869L6.26711 10.6667H2.00033C1.26395 10.6667 0.666992 10.0697 0.666992 9.33333V7.93047C0.666992 7.75627 0.701112 7.5838 0.767419 7.4228L2.83033 2.41283C2.93319 2.16303 3.17664 2 3.44679 2H10.667C11.0352 2 11.3337 2.29848 11.3337 2.66667V10.3905C11.3337 10.5673 11.2634 10.7369 11.1384 10.8619Z"
          fill={getColorFromRating(rating)}
        />
      )}
      {size === 24 && (
        <path
          d="M22 15H19V3H22C22.5523 3 23 3.44772 23 4V14C23 14.5523 22.5523 15 22 15ZM16.7071 16.2929L10.3066 22.6934C10.1307 22.8693 9.85214 22.8891 9.65308 22.7398L8.8005 22.1004C8.3158 21.7369 8.09739 21.1174 8.24686 20.5303L9.40017 16H3C1.89543 16 1 15.1046 1 14V11.8957C1 11.6344 1.05118 11.3757 1.15064 11.1342L4.24501 3.61925C4.3993 3.24455 4.76447 3 5.16969 3H16C16.5523 3 17 3.44772 17 4V15.5858C17 15.851 16.8946 16.1054 16.7071 16.2929Z"
          fill={getColorFromRating(rating)}
        />
      )}
    </svg>
  );
}
