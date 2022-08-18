import React from "react";
import Svg, { Path } from "react-native-svg";

type Props = {
  size: number;
  color: string;
};
export default function Trophy({ size = 16, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.45907 0.795441H3.70907V1.54544C3.70907 1.76084 3.70889 2.09419 3.7086 2.49867H1.61719H0.867188V3.24867V3.81641C0.867188 4.93621 1.20436 6.07726 1.79618 6.95694C2.26323 7.65115 2.93436 8.24009 3.76903 8.45428C3.99839 9.62356 4.80661 10.5745 5.67397 11.231C6.45814 11.8246 7.3982 12.2616 8.2478 12.434V15.5227H5.36386V17.0227H8.7738C8.84454 17.0448 8.91978 17.0567 8.9978 17.0567C9.07583 17.0567 9.15107 17.0448 9.22181 17.0227H12.6366V15.5227H9.7478V12.4334C10.5968 12.2607 11.5359 11.824 12.3194 11.2311C13.1869 10.5747 13.9955 9.6239 14.2251 8.45467C15.0605 8.24082 15.7321 7.65158 16.1995 6.95694C16.7913 6.07726 17.1285 4.93621 17.1285 3.81641V3.24867V2.49867H16.3785H14.2866C14.2862 2.08063 14.2858 1.74602 14.2855 1.54426L14.2843 0.795441H13.5355H4.45907ZM14.2879 3.99867C14.2886 4.92104 14.2892 5.93945 14.2895 6.80371C14.5243 6.65119 14.7501 6.42407 14.9549 6.11964C15.3403 5.54675 15.5903 4.77726 15.6244 3.99867H14.2879ZM2.3712 3.99867H3.70736L3.70677 4.66445V4.66451L3.70676 4.66613L3.70676 4.66682L3.70495 6.80297C3.47059 6.65045 3.24522 6.42357 3.04074 6.11964C2.65532 5.54675 2.40536 4.77726 2.3712 3.99867ZM5.2059 7.7906C5.2059 7.80383 5.20555 7.81698 5.20488 7.83004C5.22181 8.62257 5.74747 9.40538 6.5793 10.035C7.42657 10.6764 8.40695 11.0148 8.99639 11.0148C9.58589 11.0148 10.5667 10.6764 11.4143 10.035C12.2604 9.39478 12.7897 8.59642 12.7897 7.7906C12.7897 6.32827 12.7879 3.70583 12.7864 2.29544H5.20874C5.20831 2.93509 5.20754 3.80075 5.20676 4.66632L5.20676 4.66816C5.20564 5.92249 5.20452 7.17632 5.20446 7.74378C5.20541 7.75926 5.2059 7.77488 5.2059 7.7906Z"
        fill={color}
      />
    </Svg>
  );
}