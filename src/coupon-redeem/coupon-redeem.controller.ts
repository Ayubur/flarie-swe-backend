import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { CouponService } from '../coupon/coupon.service';

@Controller('coupon-redeem')
export class CouponRedeemController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  async redeemCoupon(@Body() body: { playerId: number; rewardId: number }) {
    try {
      const redeemedCoupon = await this.couponService.redeemCoupon(
        body.playerId,
        body.rewardId,
      );
      return redeemedCoupon;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
