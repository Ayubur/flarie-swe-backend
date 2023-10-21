import { Test, TestingModule } from '@nestjs/testing';
import { CouponRedeemController } from './coupon-redeem.controller';

describe('CouponRedeemController', () => {
  let controller: CouponRedeemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CouponRedeemController],
    }).compile();

    controller = module.get<CouponRedeemController>(CouponRedeemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
