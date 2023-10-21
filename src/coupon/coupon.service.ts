import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Coupon } from '../entities/Coupon';
import { Reward } from '../entities/Reward';
import { PlayerCoupon } from '../entities/PlayerCoupon';
import { Player } from '../entities/Player';
import { PLAYER_PER_DAY_LIMIT } from 'src/lib/constants/ApplicationConstants';
import { getNumberOfDaysFromDateRange } from 'src/lib/utils/DateUtils';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon) private couponRepository: Repository<Coupon>,
    @InjectRepository(Reward) private rewardRepository: Repository<Reward>,
    @InjectRepository(PlayerCoupon)
    private playerCouponRepository: Repository<PlayerCoupon>,
    @InjectRepository(Player) private playerRepository: Repository<Player>,
  ) { }

  async redeemCoupon(
    playerId: number,
    rewardId: number,
  ): Promise<{ id: number; value: string }> {

    const reward = await this.rewardRepository.findOne({
      where: { id: rewardId },
    });

    if (!reward) {
      throw new NotFoundException('Reward not found');
    }

    const now = new Date();
    if (now < reward.startDate || now > reward.endDate) {
      throw new BadRequestException('Invalid or expired reward');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyRedeemedCoupons = await this.playerCouponRepository.find({
      where: {
        player: { id: playerId },
        redeemedAt: today,
      },
    });

    if (dailyRedeemedCoupons.length > PLAYER_PER_DAY_LIMIT) {
      throw new BadRequestException(
        'Player has reached the daily coupon limit',
      );
    }

    const totalRedeemedCoupons = await this.playerCouponRepository.find({
      where: { player: { id: playerId } },
    });

    if (
      totalRedeemedCoupons.length >=
      getNumberOfDaysFromDateRange(reward.startDate, reward.endDate) *
      PLAYER_PER_DAY_LIMIT
    ) {
      throw new BadRequestException(
        'Player has reached the total coupon limit',
      );
    }

    const existingPlayerCoupon = await this.playerCouponRepository.findOne({
      where: {
        player: { id: playerId },
        coupon: { Reward: { id: rewardId } },
      },
    });

    if (existingPlayerCoupon) {
      throw new BadRequestException('Player has already redeemed this coupon.');
    }

    const player = await this.playerRepository.findOne({
      where: { id: playerId },
    });

    const coupon = new Coupon();
    coupon.value = `Coupon_${reward.id}`;
    coupon.Reward = reward;
    const redeemedCoupon = await this.couponRepository.save(coupon);

    const playerCoupon = new PlayerCoupon();
    playerCoupon.player = player;
    playerCoupon.coupon = redeemedCoupon;
    playerCoupon.redeemedAt = new Date();
    await this.playerCouponRepository.save(playerCoupon);

    return {
      id: redeemedCoupon.id,
      value: redeemedCoupon.value,
    };
  }
}
